const express = require("express");
const rateLimit = require("express-rate-limit");
const { getEditableFields } = require("../lib/content-fields");

const consentVersion = "community-publication-v1";

function createSubmissionsRouter({ poolProvider, siteContent }) {
  const router = express.Router();
  const submissionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  });
  const editableFields = getEditableFields(siteContent);

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
    if (typeof request.body.website === "string" && request.body.website.trim()) {
      return response.status(201).json({ message: "Thanks for your submission." });
    }
    next();
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
          error: "Choose a section field and enter wording up to 4,000 characters.",
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
          error: "Enter a quote of at least 12 characters and grant publication permission.",
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

  return router;
}

module.exports = { createSubmissionsRouter };