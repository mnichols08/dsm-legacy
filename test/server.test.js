const assert = require("node:assert/strict");
const { once } = require("node:events");
const test = require("node:test");
const app = require("../server");

test("renders the existing homepage through EJS", async (context) => {
  const server = app.listen(0);
  context.after(() => server.close());
  await once(server, "listening");

  const address = server.address();
  const origin = `http://127.0.0.1:${address.port}`;
  const response = await fetch(origin);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /<title>Diamond Star Motors: Automotive Legend<\/title>/);
  assert.match(html, /<dsm-gallery>/);
});

test("serves site content and existing assets through the backend", async (context) => {
  const server = app.listen(0);
  context.after(() => server.close());
  await once(server, "listening");

  const address = server.address();
  const origin = `http://127.0.0.1:${address.port}`;
  const [contentResponse, assetResponse, privateDataResponse] =
    await Promise.all([
      fetch(`${origin}/api/content`),
      fetch(`${origin}/css/styles.css`),
      fetch(`${origin}/data/site-content.json`),
    ]);
  const content = await contentResponse.json();

  assert.equal(contentResponse.status, 200);
  assert.equal(content.hero.title, "Diamond Star Motors");
  assert.equal(assetResponse.status, 200);
  assert.equal(privateDataResponse.status, 404);
});
