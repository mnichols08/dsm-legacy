const express = require("express");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const sharp = require("sharp");
const { getEditableFields } = require("../lib/content-fields");

const consentVersion = "community-publication-v1";

function createSubmissionsRouter({ poolProvider, siteContent, storage }) {
  const router = express.Router();
  const submissionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  });
  const editableFields = getEditableFields(siteContent);
  const parseGalleryUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 4 * 1024 * 1024,
      files: 1,
      fields: 5,
      fieldSize: 4000,
      parts: 6,
    },
  }).single("image");

  function requireDatabase(request, response, next) {
    if (!process.env.DATABASE_URL) {
      return response.status(503).json({
        error: "Community submissions are temporarily unavailable.",
      });
    }
    next();
  }

  function getText(value, maxLength) {
    if (typeof value !== "string") return null;
    const text = value.trim();
    if (!text || text.length > maxLength) return null;
    return text;
  }

  function ignoreHoneypot(request, response, next) {
    if (
      typeof request.body.website === "string" &&
      request.body.website.trim()
    ) {
      return response
        .status(201)
        .json({ message: "Thanks for your submission." });
    }
    next();
  }

  function requireBlobStorage(request, response, next) {
    if (!storage?.isConfigured()) {
      return response.status(503).json({
        error: "Gallery uploads are temporarily unavailable.",
      });
    }
    next();
  }

  function parseImage(request, response, next) {
    parseGalleryUpload(request, response, (error) => {
      if (!error) return next();
      const tooLarge = error.code === "LIMIT_FILE_SIZE";
      response.status(tooLarge ? 413 : 400).json({
        error: tooLarge
          ? "Choose an image smaller than 4 MiB."
          : "The image upload could not be read.",
      });
    });
  }

  router.post(
    "/wording",
    submissionLimiter,
    requireDatabase,
    ignoreHoneypot,
    async (request, response) => {
      const selection = request.body.field;
      const field = editableFields.find(
        ({ sectionKey, fieldKey }) => `${sectionKey}.${fieldKey}` === selection,
      );
      const proposedValue = getText(request.body.proposedValue, 4000);
      const contributorName = getText(request.body.contributorName, 80);

      if (!field || !proposedValue) {
        return response.status(400).json({
          error:
            "Choose a section field and enter wording up to 4,000 characters.",
        });
      }

      await poolProvider().query(
        `INSERT INTO content_suggestions
           (section_key, field_key, proposed_value, contributor_name)
         VALUES ($1, $2, $3, $4)`,
        [field.sectionKey, field.fieldKey, proposedValue, contributorName],
      );

      response.status(201).json({
        message: "Thanks. Your wording suggestion is pending moderator review.",
      });
    },
  );

  router.post(
    "/quote",
    submissionLimiter,
    requireDatabase,
    ignoreHoneypot,
    async (request, response) => {
      const quote = getText(request.body.quote, 800);
      const contributorName = getText(request.body.contributorName, 80);
      const hasConsent =
        request.body.publicationConsent === "on" ||
        request.body.publicationConsent === true;

      if (!quote || quote.length < 12 || !hasConsent) {
        return response.status(400).json({
          error:
            "Enter a quote of at least 12 characters and grant publication permission.",
        });
      }

      await poolProvider().query(
        `INSERT INTO quote_submissions
           (quote, contributor_name, publication_consent, consent_version, consented_at)
         VALUES ($1, $2, true, $3, CURRENT_TIMESTAMP)`,
        [quote, contributorName, consentVersion],
      );

      response.status(201).json({
        message: "Thanks. Your quote is pending moderator review.",
      });
    },
  );

  router.post(
    "/gallery",
    submissionLimiter,
    requireDatabase,
    requireBlobStorage,
    parseImage,
    ignoreHoneypot,
    async (request, response) => {
      const caption = getText(request.body.caption, 160);
      const altText = getText(request.body.altText, 250);
      const contributorName = getText(request.body.contributorName, 80);
      const hasConsent = request.body.publicationConsent === "on";

      if (!request.file || !caption || !altText || !hasConsent) {
        return response.status(400).json({
          error:
            "Choose an image, add a caption and description, and grant publication permission.",
        });
      }

      let metadata;
      let normalizedImage;
      try {
        const image = sharp(request.file.buffer, {
          failOn: "error",
          limitInputPixels: 20_000_000,
        });
        metadata = await image.metadata();
        if (
          !["jpeg", "png", "webp"].includes(metadata.format) ||
          !metadata.width ||
          !metadata.height ||
          metadata.width < 240 ||
          metadata.height < 160
        ) {
          return response.status(400).json({
            error:
              "Use a valid JPEG, PNG, or WebP image at least 240 by 160 pixels.",
          });
        }

        normalizedImage = await image
          .rotate()
          .resize({
            width: 2400,
            height: 1800,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 82 })
          .toBuffer();
      } catch (error) {
        return response.status(400).json({
          error: "The uploaded file is not a supported, decodable image.",
        });
      }

      let storageKey;
      try {
        storageKey = await storage.putPrivateImage(normalizedImage);
        await poolProvider().query(
          `INSERT INTO gallery_submissions
             (storage_key, caption, alt_text, contributor_name, publication_consent, consent_version, consented_at)
           VALUES ($1, $2, $3, $4, true, $5, CURRENT_TIMESTAMP)`,
          [storageKey, caption, altText, contributorName, consentVersion],
        );
      } catch (error) {
        if (storageKey) {
          await storage.deletePrivateImage(storageKey).catch((cleanupError) => {
            console.error(
              "Unable to clean up failed gallery upload:",
              cleanupError.message,
            );
          });
        }
        throw error;
      }

      response.status(201).json({
        message: "Thanks. Your image is pending moderator review.",
      });
    },
  );

  return router;
}

module.exports = { createSubmissionsRouter };
