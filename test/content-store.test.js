const assert = require("node:assert/strict");
const test = require("node:test");
const siteContent = require("../data/site-content.json");
const { getEditableFields } = require("../lib/content-fields");
const { applyContentOverrides } = require("../lib/content-store");

test("editable wording fields include copy but exclude asset paths", () => {
  const fields = getEditableFields(siteContent);
  const fieldPaths = new Set(
    fields.map(({ sectionKey, fieldKey }) => `${sectionKey}.${fieldKey}`),
  );

  assert.ok(fieldPaths.has("hero.title"));
  assert.ok(fieldPaths.has("about.paragraphs.0"));
  assert.ok(!fieldPaths.has("hero.image"));
});

test("published overrides update only allowlisted text and do not mutate source", () => {
  const updated = applyContentOverrides(siteContent, [
    {
      section_key: "about",
      field_key: "paragraphs.0",
      value: "Approved copy.",
    },
    {
      section_key: "hero",
      field_key: "image",
      value: "https://invalid.example/image.jpg",
    },
  ]);

  assert.equal(updated.about.paragraphs[0], "Approved copy.");
  assert.equal(
    siteContent.about.paragraphs[0],
    "Chrysler's 1970 purchase of a 15% stake in Mitsubishi opened the door for rebadged Mitsubishis to fill America's demand for efficient compacts. By the early 1980s both companies were clashing with import quotas and dealership restrictions, making a U.S.-built solution essential.",
  );
  assert.equal(updated.hero.image, siteContent.hero.image);
});
