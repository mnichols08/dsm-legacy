const fs = require("node:fs");
const path = require("node:path");
const { getPool } = require("../lib/database");

const content = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "..", "data", "site-content.json"),
    "utf8",
  ),
);

async function seedContent() {
  const pool = getPool();

  try {
    const result = await pool.query(
      `INSERT INTO site_content (id, content)
       VALUES (1, $1::jsonb)
       ON CONFLICT (id) DO NOTHING`,
      [JSON.stringify(content)],
    );

    console.log(
      result.rowCount === 1
        ? "Imported initial site content into Postgres."
        : "Site content already exists; left it unchanged.",
    );
  } finally {
    await pool.end();
  }
}

seedContent().catch((error) => {
  console.error("Unable to seed site content:", error.message);
  process.exitCode = 1;
});
