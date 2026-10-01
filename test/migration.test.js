const assert = require("node:assert/strict");
const test = require("node:test");
const migration = require("../migrations/001_initial_submission_schema");
const csrfMigration = require("../migrations/002_admin_session_csrf_token");

test("initial migration creates the planned persistence tables", () => {
  const tables = new Set();
  const constraints = new Set();
  const pgm = {
    createTable(name) {
      tables.add(name);
    },
    addConstraint(table, name) {
      constraints.add(`${table}.${name}`);
    },
    createIndex() {},
    func: (expression) => expression,
  };

  migration.up(pgm);

  for (const table of [
    "site_content",
    "admin_users",
    "admin_sessions",
    "content_suggestions",
    "quote_submissions",
    "gallery_submissions",
    "content_revisions",
    "published_content_overrides",
    "moderation_events",
  ]) {
    assert.ok(tables.has(table), `Expected table ${table}`);
  }

  assert.ok(
    constraints.has("quote_submissions.quote_submissions_consent_check"),
  );
  assert.ok(constraints.has("admin_users.admin_users_email_lowercase_check"));
  assert.ok(
    constraints.has("gallery_submissions.gallery_submissions_consent_check"),
  );
});

test("initial migration can be rolled back in dependency order", () => {
  const droppedTables = [];
  migration.down({
    dropTable(name) {
      droppedTables.push(name);
    },
  });

  assert.equal(droppedTables[0], "moderation_events");
  assert.equal(droppedTables.at(-1), "site_content");
});

test("admin-session CSRF token migration is reversible", () => {
  let addedColumn;
  let droppedColumn;
  csrfMigration.up({
    addColumn(table, columns) {
      addedColumn = { table, columns };
    },
  });
  csrfMigration.down({
    dropColumn(table, column) {
      droppedColumn = { table, column };
    },
  });

  assert.equal(addedColumn.table, "admin_sessions");
  assert.ok(addedColumn.columns.csrf_token);
  assert.deepEqual(droppedColumn, {
    table: "admin_sessions",
    column: "csrf_token",
  });
});
