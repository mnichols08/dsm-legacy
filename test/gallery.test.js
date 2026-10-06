const assert = require("node:assert/strict");
const { once } = require("node:events");
const { Readable } = require("node:stream");
const sharp = require("sharp");
const test = require("node:test");
const { createApp } = require("../server");

function galleryForm(image, filename = "upload.png") {
  const form = new FormData();
  form.set("image", new Blob([image], { type: "image/png" }), filename);
  form.set("caption", "DSM at the track");
  form.set("altText", "A red DSM coupe on a race track");
  form.set("contributorName", "Trackside Owner");
  form.set("publicationConsent", "on");
  return form;
}

test("image submissions decode, normalize to WebP, and remain pending", async (context) => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgres://unit-test.invalid/dsm";
  const imageBytes = await sharp({
    create: {
      width: 320,
      height: 240,
      channels: 3,
      background: { r: 190, g: 40, b: 40 },
    },
  })
    .png()
    .toBuffer();
  const queries = [];
  let storedBuffer;
  let deletedKey;
  const pool = {
    async query(sql, parameters) {
      queries.push({ sql, parameters });
      return { rows: [], rowCount: 1 };
    },
  };
  const storage = {
    isConfigured: () => true,
    async putPrivateImage(buffer) {
      storedBuffer = buffer;
      return "gallery/Approved-uuid-random.webp";
    },
    async deletePrivateImage(key) {
      deletedKey = key;
    },
    async getPrivateImage() {
      return null;
    },
  };
  const server = createApp({ poolProvider: () => pool, storage }).listen(0);
  context.after(() => {
    server.close();
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;
  });
  await once(server, "listening");
  const origin = `http://127.0.0.1:${server.address().port}`;

  const accepted = await fetch(`${origin}/api/submissions/gallery`, {
    method: "POST",
    body: galleryForm(imageBytes),
  });
  const invalid = await fetch(`${origin}/api/submissions/gallery`, {
    method: "POST",
    body: galleryForm(Buffer.from("not an image"), "fake.png"),
  });
  const oversized = await fetch(`${origin}/api/submissions/gallery`, {
    method: "POST",
    body: galleryForm(Buffer.alloc(4 * 1024 * 1024 + 1), "large.png"),
  });

  assert.equal(accepted.status, 201);
  assert.equal(invalid.status, 400);
  assert.equal(oversized.status, 413);
  assert.equal(
    await sharp(storedBuffer)
      .metadata()
      .then(({ format }) => format),
    "webp",
  );
  assert.equal(queries.length, 1);
  assert.match(queries[0].sql, /INSERT INTO gallery_submissions/);
  assert.equal(queries[0].parameters[0], "gallery/Approved-uuid-random.webp");
  assert.equal(queries[0].parameters[4], "community-publication-v1");
  assert.equal(deletedKey, undefined);
});

test("failed database insertion deletes the private uploaded image", async (context) => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgres://unit-test.invalid/dsm";
  const imageBytes = await sharp({
    create: {
      width: 320,
      height: 240,
      channels: 3,
      background: { r: 190, g: 40, b: 40 },
    },
  })
    .png()
    .toBuffer();
  let deletedKey;
  const storage = {
    isConfigured: () => true,
    async putPrivateImage() {
      return "gallery/pending-image.webp";
    },
    async deletePrivateImage(key) {
      deletedKey = key;
    },
  };
  const pool = {
    async query() {
      throw new Error("database unavailable");
    },
  };
  const server = createApp({ poolProvider: () => pool, storage }).listen(0);
  context.after(() => {
    server.close();
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;
  });
  await once(server, "listening");

  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/api/submissions/gallery`,
    { method: "POST", body: galleryForm(imageBytes) },
  );

  assert.equal(response.status, 500);
  assert.equal(deletedKey, "gallery/pending-image.webp");
});

test("private image bytes are served only for approved gallery records", async (context) => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgres://unit-test.invalid/dsm";
  const storedImage = await sharp({
    create: {
      width: 320,
      height: 240,
      channels: 3,
      background: { r: 20, g: 100, b: 180 },
    },
  })
    .webp()
    .toBuffer();
  const storageReads = [];
  const pool = {
    async query(sql, parameters) {
      if (sql.includes("FROM gallery_submissions")) {
        return parameters[0] === 42
          ? { rows: [{ storage_key: "gallery/approved.webp" }] }
          : { rows: [] };
      }
      return { rows: [] };
    },
  };
  const storage = {
    isConfigured: () => true,
    async putPrivateImage() {},
    async deletePrivateImage() {},
    async getPrivateImage(key) {
      storageReads.push(key);
      return {
        statusCode: 200,
        stream: Readable.toWeb(Readable.from([storedImage])),
      };
    },
  };
  const server = createApp({ poolProvider: () => pool, storage }).listen(0);
  context.after(() => {
    server.close();
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;
  });
  await once(server, "listening");
  const origin = `http://127.0.0.1:${server.address().port}`;

  const approved = await fetch(`${origin}/media/gallery/42`);
  const unapproved = await fetch(`${origin}/media/gallery/43`);

  assert.equal(approved.status, 200);
  assert.equal(approved.headers.get("content-type"), "image/webp");
  assert.equal(approved.headers.get("cache-control"), "no-store");
  assert.equal(
    await sharp(Buffer.from(await approved.arrayBuffer()))
      .metadata()
      .then(({ format }) => format),
    "webp",
  );
  assert.equal(unapproved.status, 404);
  assert.deepEqual(storageReads, ["gallery/approved.webp"]);
});

test("homepage includes only approved gallery metadata with escaped attributes", async (context) => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgres://unit-test.invalid/dsm";
  const pool = {
    async query(sql) {
      if (sql.includes("FROM quote_submissions")) return { rows: [] };
      if (sql.includes("FROM gallery_submissions")) {
        return {
          rows: [
            {
              id: 81,
              caption: "Car & owner",
              alt_text: "Red & white DSM",
            },
          ],
        };
      }
      if (sql.includes("SELECT content FROM site_content")) {
        return { rows: [{ content: require("../data/site-content.json") }] };
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
  assert.match(html, /image="\/media\/gallery\/81"/);
  assert.match(html, /caption="Car &amp; owner"/);
  assert.match(html, /alt="Red &amp; white DSM"/);
});
