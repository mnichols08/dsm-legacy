const crypto = require("node:crypto");
const express = require("express");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const { Readable } = require("node:stream");
const { getEditableFields } = require("../lib/content-fields");

const sessionCookieName = "dsm_admin_session";
const loginCookieName = "dsm_login_csrf";
const sessionDurationMs = 8 * 60 * 60 * 1000;
const submissionTables = {
  wording: "content_suggestions",
  quote: "quote_submissions",
  gallery: "gallery_submissions",
};

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function matchesToken(expected, actual) {
  if (typeof expected !== "string" || typeof actual !== "string") return false;
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  return (
    expectedBuffer.length === actualBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, actualBuffer)
  );
}

function cookieOptions(request, maxAge, cookiePath) {
  return {
    httpOnly: true,
    secure: request.secure || process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: cookiePath,
    maxAge,
  };
}

function createAdminRouter({ poolProvider, siteContent, storage }) {
  const router = express.Router();
  router.use((request, response, next) => {
    response.set("Cache-Control", "no-store");
    next();
  });
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  });
  const editableFields = new Set(
    getEditableFields(siteContent).map(
      ({ sectionKey, fieldKey }) => `${sectionKey}.${fieldKey}`,
    ),
  );

  router.get("/login", (request, response) => {
    const csrfToken = crypto.randomBytes(32).toString("base64url");
    response.cookie(
      loginCookieName,
      csrfToken,
      cookieOptions(request, 10 * 60 * 1000, "/admin/login"),
    );
    response.render("admin-login", { csrfToken, error: null });
  });

  router.post("/login", loginLimiter, async (request, response) => {
    const cookieToken = request.cookies[loginCookieName];
    const formToken = request.body._csrf;
    if (!matchesToken(cookieToken, formToken)) {
      return response.status(403).render("admin-login", {
        csrfToken: "",
        error: "Your sign-in form expired. Reload and try again.",
      });
    }

    if (!process.env.DATABASE_URL) {
      return response.status(503).render("admin-login", {
        csrfToken: formToken,
        error: "Admin sign-in is not configured.",
      });
    }

    const email =
      typeof request.body.email === "string"
        ? request.body.email.trim().toLowerCase().slice(0, 254)
        : "";
    const password =
      typeof request.body.password === "string"
        ? request.body.password.slice(0, 200)
        : "";
    const pool = poolProvider();
    const result = await pool.query(
      `SELECT id, email, password_hash, role
       FROM admin_users
       WHERE email = $1 AND disabled_at IS NULL`,
      [email],
    );
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return response.status(401).render("admin-login", {
        csrfToken: formToken,
        error: "Email or password is incorrect.",
      });
    }

    const sessionToken = crypto.randomBytes(32).toString("base64url");
    const sessionCsrfToken = crypto.randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + sessionDurationMs);
    await pool.query(
      `INSERT INTO admin_sessions
         (token_hash, csrf_token, admin_user_id, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [hash(sessionToken), sessionCsrfToken, user.id, expiresAt],
    );

    response.clearCookie(loginCookieName, { path: "/admin/login" });
    response.cookie(
      sessionCookieName,
      sessionToken,
      cookieOptions(request, sessionDurationMs, "/admin"),
    );
    response.redirect(303, "/admin");
  });

  async function requireAdmin(request, response, next) {
    if (!process.env.DATABASE_URL) {
      return response.status(503).send("Admin sign-in is not configured.");
    }

    const sessionToken = request.cookies[sessionCookieName];
    if (!sessionToken) return response.redirect(303, "/admin/login");

    const result = await poolProvider().query(
      `SELECT users.id, users.email, users.role, sessions.csrf_token
       FROM admin_sessions AS sessions
       JOIN admin_users AS users ON users.id = sessions.admin_user_id
       WHERE sessions.token_hash = $1
         AND sessions.expires_at > CURRENT_TIMESTAMP
         AND users.disabled_at IS NULL`,
      [hash(sessionToken)],
    );

    if (!result.rows[0]) {
      response.clearCookie(sessionCookieName, { path: "/admin" });
      return response.redirect(303, "/admin/login");
    }

    request.admin = result.rows[0];
    next();
  }

  function requireCsrf(request, response, next) {
    if (!matchesToken(request.admin.csrf_token, request.body._csrf)) {
      return response.status(403).send("Invalid CSRF token.");
    }
    next();
  }

  router.get("/", requireAdmin, async (request, response) => {
    const pool = poolProvider();
    const [wordingResult, quoteResult, galleryResult] = await Promise.all([
      pool.query(
        `SELECT id, section_key, field_key, proposed_value, contributor_name, created_at
         FROM content_suggestions WHERE status = 'pending' ORDER BY created_at ASC LIMIT 100`,
      ),
      pool.query(
        `SELECT id, quote, contributor_name, created_at
         FROM quote_submissions WHERE status = 'pending' ORDER BY created_at ASC LIMIT 100`,
      ),
      pool.query(
        `SELECT id, storage_key, caption, alt_text, contributor_name, created_at
         FROM gallery_submissions WHERE status = 'pending' ORDER BY created_at ASC LIMIT 100`,
      ),
    ]);

    response.render("admin-queue", {
      admin: request.admin,
      csrfToken: request.admin.csrf_token,
      wordingSuggestions: wordingResult.rows,
      quotes: quoteResult.rows,
      gallerySubmissions: galleryResult.rows,
      notice: request.query.notice || "",
    });
  });

  router.post(
    "/logout",
    requireAdmin,
    requireCsrf,
    async (request, response) => {
      const sessionToken = request.cookies[sessionCookieName];
      await poolProvider().query(
        "DELETE FROM admin_sessions WHERE token_hash = $1",
        [hash(sessionToken)],
      );

      response.clearCookie(sessionCookieName, { path: "/admin" });
      response.redirect(303, "/admin/login");
    },
  );

  router.get(
    "/submissions/gallery/:id/preview",
    requireAdmin,
    async (request, response) => {
      const submissionId = Number(request.params.id);
      if (!Number.isSafeInteger(submissionId) || submissionId < 1) {
        return response.status(404).send("Not found");
      }

      const result = await poolProvider().query(
        `SELECT storage_key
         FROM gallery_submissions
         WHERE id = $1 AND status = 'pending' AND publication_consent = true`,
        [submissionId],
      );
      if (!result.rows[0] || !storage?.isConfigured()) {
        return response.status(404).send("Not found");
      }

      const image = await storage.getPrivateImage(result.rows[0].storage_key);
      if (!image || image.statusCode !== 200 || !image.stream) {
        return response.status(404).send("Not found");
      }

      response.set({
        "Cache-Control": "private, no-store",
        "Content-Disposition": "inline",
        "Content-Type": "image/webp",
        "X-Content-Type-Options": "nosniff",
      });
      Readable.fromWeb(image.stream).pipe(response);
    },
  );

  router.post(
    "/submissions/:type/:id/review",
    requireAdmin,
    requireCsrf,
    async (request, response) => {
      const table = submissionTables[request.params.type];
      const submissionId = Number(request.params.id);
      const action = request.body.action;
      const note =
        typeof request.body.note === "string"
          ? request.body.note.trim().slice(0, 500)
          : "";

      if (
        !table ||
        !Number.isSafeInteger(submissionId) ||
        submissionId < 1 ||
        !["approved", "rejected"].includes(action)
      ) {
        return response.status(400).send("Invalid moderation action.");
      }

      const pool = poolProvider();
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const submissionResult = await client.query(
          `SELECT * FROM ${table} WHERE id = $1 FOR UPDATE`,
          [submissionId],
        );
        const submission = submissionResult.rows[0];

        if (!submission || submission.status !== "pending") {
          await client.query("ROLLBACK");
          return response
            .status(409)
            .send("This submission has already been reviewed.");
        }

        if (request.params.type === "wording" && action === "approved") {
          const fullPath = `${submission.section_key}.${submission.field_key}`;
          if (!editableFields.has(fullPath)) {
            await client.query("ROLLBACK");
            return response
              .status(409)
              .send("This content field is no longer editable.");
          }

          const contentResult = await client.query(
            "SELECT content FROM site_content WHERE id = 1 FOR UPDATE",
          );
          if (!contentResult.rows[0]) {
            await client.query("ROLLBACK");
            return response
              .status(409)
              .send("Import site content before approving wording changes.");
          }
          const persistedFields = new Set(
            getEditableFields(contentResult.rows[0].content).map(
              ({ sectionKey, fieldKey }) => `${sectionKey}.${fieldKey}`,
            ),
          );
          if (!persistedFields.has(fullPath)) {
            await client.query("ROLLBACK");
            return response
              .status(409)
              .send("This content field is no longer available.");
          }

          const revisionResult = await client.query(
            `INSERT INTO content_revisions
               (section_key, field_key, value, source_suggestion_id, approved_by)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [
              submission.section_key,
              submission.field_key,
              submission.proposed_value,
              submission.id,
              request.admin.id,
            ],
          );
          await client.query(
            `INSERT INTO published_content_overrides
               (section_key, field_key, revision_id)
             VALUES ($1, $2, $3)
             ON CONFLICT (section_key, field_key)
             DO UPDATE SET revision_id = EXCLUDED.revision_id, updated_at = CURRENT_TIMESTAMP`,
            [
              submission.section_key,
              submission.field_key,
              revisionResult.rows[0].id,
            ],
          );
        }

        await client.query(
          `UPDATE ${table}
           SET status = $1, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $2, moderator_note = $3
           WHERE id = $4`,
          [action, request.admin.id, note || null, submissionId],
        );
        await client.query(
          `INSERT INTO moderation_events
             (moderator_id, submission_type, submission_id, action, note)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            request.admin.id,
            request.params.type,
            submissionId,
            action,
            note || null,
          ],
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }

      if (request.params.type === "gallery" && action === "rejected") {
        const storageResult = await pool.query(
          "SELECT storage_key FROM gallery_submissions WHERE id = $1",
          [submissionId],
        );
        if (storageResult.rows[0] && storage?.isConfigured()) {
          await storage
            .deletePrivateImage(storageResult.rows[0].storage_key)
            .catch((error) => {
              console.error(
                "Unable to delete rejected gallery image:",
                error.message,
              );
            });
        }
      }

      response.redirect(303, "/admin?notice=Decision+saved");
    },
  );

  return router;
}

module.exports = { createAdminRouter };
