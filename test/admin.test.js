const assert = require("node:assert/strict");
const { once } = require("node:events");
const { Readable } = require("node:stream");
const bcrypt = require("bcryptjs");
const test = require("node:test");
const { createApp } = require("../server");

function cookieValue(setCookie, name) {
  return setCookie.split(";")[0].slice(name.length + 1);
}

test("admin can log in with CSRF protection and approve a wording suggestion", async (context) => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgres://unit-test.invalid/dsm";
  const queryLog = [];
  const deletedImages = [];
  const sessionToken = "unit-test-session-token";
  const csrfToken = "unit-test-session-csrf-token";
  const user = {
    id: 7,
    email: "moderator@example.test",
    role: "moderator",
    password_hash: await bcrypt.hash("CorrectHorseBatteryStaple", 4),
  };
  const client = {
    async query(sql, parameters) {
      queryLog.push({ sql, parameters });
      if (sql.includes("SELECT * FROM content_suggestions")) {
        return {
          rows: [
            {
              id: 13,
              status: "pending",
              section_key: "about",
              field_key: "headline",
              proposed_value: "Approved partnership headline",
            },
          ],
        };
      }
      if (sql.includes("SELECT * FROM gallery_submissions")) {
        return {
          rows: [
            {
              id: 15,
              status: "pending",
              storage_key: "gallery/pending-image.webp",
            },
          ],
        };
      }
      if (sql.includes("SELECT content FROM site_content")) {
        return { rows: [{ content: require("../data/site-content.json") }] };
      }
      if (sql.includes("INSERT INTO content_revisions")) {
        return { rows: [{ id: 24 }] };
      }
      return { rows: [] };
    },
    release() {},
  };
  const pool = {
    async query(sql, parameters) {
      queryLog.push({ sql, parameters });
      if (sql.includes("WHERE email = $1")) return { rows: [user] };
      if (sql.includes("FROM admin_sessions AS sessions")) {
        return {
          rows: [{ ...user, csrf_token: csrfToken }],
        };
      }
      if (sql.includes("FROM content_suggestions WHERE status")) {
        return { rows: [] };
      }
      if (sql.includes("FROM quote_submissions WHERE status")) {
        return { rows: [] };
      }
      if (sql.includes("FROM gallery_submissions WHERE status")) {
        return {
          rows: [
            {
              id: 15,
              storage_key: "gallery/pending-image.webp",
              caption: "Trackside DSM",
              alt_text: "A DSM at the track",
              contributor_name: "Owner",
              created_at: new Date(),
            },
          ],
        };
      }
      if (sql.includes("WHERE id = $1 AND status = 'pending'")) {
        return { rows: [{ storage_key: "gallery/pending-image.webp" }] };
      }
      if (
        sql.includes("SELECT storage_key FROM gallery_submissions WHERE id")
      ) {
        return { rows: [{ storage_key: "gallery/pending-image.webp" }] };
      }
      return { rows: [] };
    },
    async connect() {
      return client;
    },
  };
  const storage = {
    isConfigured: () => true,
    async getPrivateImage() {
      return {
        statusCode: 200,
        stream: Readable.toWeb(Readable.from([Buffer.from("webp-test")])),
      };
    },
    async deletePrivateImage(key) {
      deletedImages.push(key);
    },
    async putPrivateImage() {},
  };
  const server = createApp({ poolProvider: () => pool, storage }).listen(0);
  context.after(() => {
    server.close();
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;
  });
  await once(server, "listening");
  const origin = `http://127.0.0.1:${server.address().port}`;

  const loginPage = await fetch(`${origin}/admin/login`);
  const loginCookie = cookieValue(
    loginPage.headers.get("set-cookie"),
    "dsm_login_csrf",
  );
  const loginHtml = await loginPage.text();
  const loginCsrf = loginHtml.match(/name="_csrf" value="([^"]+)"/)[1];
  const loginResponse = await fetch(`${origin}/admin/login`, {
    method: "POST",
    redirect: "manual",
    headers: {
      Cookie: `dsm_login_csrf=${loginCookie}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      _csrf: loginCsrf,
      email: user.email,
      password: "CorrectHorseBatteryStaple",
    }),
  });

  assert.equal(loginResponse.status, 303);
  assert.equal(loginResponse.headers.get("location"), "/admin");
  const sessionCookie = loginResponse.headers
    .getSetCookie()
    .find((cookie) => cookie.startsWith("dsm_admin_session="));
  const sessionCookieToken = cookieValue(sessionCookie, "dsm_admin_session");

  const queueResponse = await fetch(`${origin}/admin`, {
    headers: { Cookie: `dsm_admin_session=${sessionCookieToken}` },
  });
  const queueHtml = await queueResponse.text();
  assert.equal(queueResponse.status, 200);
  assert.match(queueHtml, /Submission review/);
  assert.match(queueHtml, /moderator@example\.test/);
  assert.match(queueHtml, /Trackside DSM/);

  const previewResponse = await fetch(
    `${origin}/admin/submissions/gallery/15/preview`,
    { headers: { Cookie: `dsm_admin_session=${sessionCookieToken}` } },
  );
  assert.equal(previewResponse.status, 200);
  assert.equal(
    previewResponse.headers.get("cache-control"),
    "private, no-store",
  );

  const reviewResponse = await fetch(
    `${origin}/admin/submissions/wording/13/review`,
    {
      method: "POST",
      redirect: "manual",
      headers: {
        Cookie: `dsm_admin_session=${sessionCookieToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        _csrf: csrfToken,
        action: "approved",
        note: "Checked historical source.",
      }),
    },
  );

  assert.equal(reviewResponse.status, 303);
  assert.equal(
    reviewResponse.headers.get("location"),
    "/admin?notice=Decision+saved",
  );
  assert.ok(
    queryLog.some(({ sql }) => sql.includes("INSERT INTO content_revisions")),
  );
  assert.ok(
    queryLog.some(({ sql }) =>
      sql.includes("INSERT INTO published_content_overrides"),
    ),
  );
  assert.ok(
    queryLog.some(({ sql }) => sql.includes("INSERT INTO moderation_events")),
  );
  assert.ok(queryLog.some(({ sql }) => sql === "COMMIT"));

  const galleryReviewResponse = await fetch(
    `${origin}/admin/submissions/gallery/15/review`,
    {
      method: "POST",
      redirect: "manual",
      headers: {
        Cookie: `dsm_admin_session=${sessionCookieToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ _csrf: csrfToken, action: "rejected" }),
    },
  );
  assert.equal(galleryReviewResponse.status, 303);
  assert.deepEqual(deletedImages, ["gallery/pending-image.webp"]);
});
