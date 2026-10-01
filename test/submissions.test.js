const assert = require("node:assert/strict");
const { once } = require("node:events");
const test = require("node:test");
const { createApp } = require("../server");

test("valid text submissions are stored and invalid ones are rejected", async (context) => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgres://unit-test.invalid/dsm";
  const queries = [];
  const pool = {
    async query(sql, parameters) {
      queries.push({ sql, parameters });
      return { rows: [], rowCount: 1 };
    },
  };
  const server = createApp({ poolProvider: () => pool }).listen(0);
  context.after(() => {
    server.close();
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;
  });
  await once(server, "listening");

  const origin = `http://127.0.0.1:${server.address().port}`;
  const submit = (path, values) => fetch(`${origin}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(values),
  });

  const invalidQuote = await submit("/api/submissions/quote", {
    quote: "A real quote, but no consent.",
  });
  const invalidField = await submit("/api/submissions/wording", {
    field: "hero.image",
    proposedValue: "not an editable text field",
  });
  const quoteResponse = await submit("/api/submissions/quote", {
    quote: "This car changed how I think about performance.",
    contributorName: "DSM Owner",
    publicationConsent: "on",
  });
  const wordingResponse = await submit("/api/submissions/wording", {
    field: "about.headline",
    proposedValue: "A suggested partnership headline",
  });

  assert.equal(invalidQuote.status, 400);
  assert.equal(invalidField.status, 400);
  assert.equal(quoteResponse.status, 201);
  assert.equal(wordingResponse.status, 201);
  assert.equal(queries.length, 2);
  assert.match(queries[0].sql, /INSERT INTO quote_submissions/);
  assert.equal(queries[0].parameters[2], "community-publication-v1");
  assert.deepEqual(queries[1].parameters.slice(0, 2), ["about", "headline"]);
});

test("submission routes fail closed when Postgres is not configured", async (context) => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  const server = createApp().listen(0);
  context.after(() => {
    server.close();
    if (previousDatabaseUrl !== undefined) process.env.DATABASE_URL = previousDatabaseUrl;
  });
  await once(server, "listening");

  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/api/submissions/quote`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        quote: "A valid quote submitted while offline.",
        publicationConsent: "on",
      }),
    },
  );

  assert.equal(response.status, 503);
});

test("admin review routes require a valid session", async (context) => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgres://unit-test.invalid/dsm";
  const pool = { async query() { throw new Error("Unauthenticated route queried the database"); } };
  const server = createApp({ poolProvider: () => pool }).listen(0);
  context.after(() => {
    server.close();
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;
  });
  await once(server, "listening");

  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/admin/submissions/quote/1/review`,
    {
      method: "POST",
      redirect: "manual",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ action: "approved" }),
    },
  );

  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "/admin/login");
});

test("homepage renders approved quotes as escaped text", async (context) => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgres://unit-test.invalid/dsm";
  const pool = {
    async query(sql) {
      if (sql.includes("SELECT content FROM site_content")) {
        return { rows: [{ content: require("../data/site-content.json") }] };
      }
      if (sql.includes("FROM published_content_overrides")) {
        return { rows: [] };
      }
      if (sql.includes("FROM quote_submissions")) {
        return {
          rows: [{ quote: "<script>alert(1)</script>", contributor_name: "Owner" }],
        };
      }
      return { rows: [] };
    },
  };
  const server = createApp({ poolProvider: () => pool }).listen(0);
  context.after(() => {
    server.close();
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;
  });
  await once(server, "listening");

  const response = await fetch(`http://127.0.0.1:${server.address().port}/`);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
});