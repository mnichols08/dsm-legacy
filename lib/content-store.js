const { getEditableFields } = require("./content-fields");

function applyContentOverrides(content, overrides) {
  const updatedContent = structuredClone(content);
  const editableFields = new Set(
    getEditableFields(updatedContent).map(
      ({ sectionKey, fieldKey }) => `${sectionKey}.${fieldKey}`,
    ),
  );

  for (const override of overrides) {
    const fullPath = `${override.section_key}.${override.field_key}`;
    if (!editableFields.has(fullPath)) continue;

    const segments = fullPath.split(".");
    let target = updatedContent;
    for (const segment of segments.slice(0, -1)) {
      target = target?.[segment];
    }

    const leaf = segments.at(-1);
    if (target && Object.hasOwn(target, leaf) && typeof target[leaf] === "string") {
      target[leaf] = override.value;
    }
  }

  return updatedContent;
}

async function getPublishedContent(poolProvider, fallbackContent) {
  let pool;
  try {
    pool = poolProvider();
  } catch (error) {
    if (!process.env.DATABASE_URL) return fallbackContent;
    throw error;
  }

  const contentResult = await pool.query(
    "SELECT content FROM site_content WHERE id = 1",
  );
  if (!contentResult.rows[0]) return fallbackContent;

  const overrideResult = await pool.query(
    `SELECT revision.section_key, revision.field_key, revision.value
     FROM published_content_overrides AS published
     JOIN content_revisions AS revision ON revision.id = published.revision_id`,
  );

  return applyContentOverrides(contentResult.rows[0].content, overrideResult.rows);
}

async function getApprovedQuotes(poolProvider) {
  let pool;
  try {
    pool = poolProvider();
  } catch (error) {
    if (!process.env.DATABASE_URL) return [];
    throw error;
  }

  const result = await pool.query(
    `SELECT quote, contributor_name
     FROM quote_submissions
     WHERE status = 'approved' AND publication_consent = true
     ORDER BY reviewed_at DESC, id DESC
     LIMIT 24`,
  );
  return result.rows;
}

module.exports = { applyContentOverrides, getApprovedQuotes, getPublishedContent };