const excludedKeys = new Set(["ctaLink", "image", "id", "value"]);

function formatSegment(segment) {
  if (/^\d+$/.test(segment)) {
    return `Item ${Number(segment) + 1}`;
  }

  return segment
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (character) => character.toUpperCase());
}

function getEditableFields(content) {
  const fields = [];

  function visit(value, path) {
    if (typeof value === "string") {
      if (path.length > 1 && !path.some((segment) => excludedKeys.has(segment))) {
        fields.push({
          sectionKey: path[0],
          fieldKey: path.slice(1).join("."),
          label: path.map(formatSegment).join(" > "),
        });
      }
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, [...path, String(index)]));
      return;
    }

    if (value && typeof value === "object") {
      for (const [key, nestedValue] of Object.entries(value)) {
        visit(nestedValue, [...path, key]);
      }
    }
  }

  visit(content, []);
  return fields;
}

module.exports = { getEditableFields };