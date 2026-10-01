const crypto = require("node:crypto");
const { del, get, put } = require("@vercel/blob");

function isConfigured() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
    (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID),
  );
}

async function putPrivateImage(buffer) {
  const blob = await put(`gallery/${crypto.randomUUID()}.webp`, buffer, {
    access: "private",
    addRandomSuffix: true,
    contentType: "image/webp",
    cacheControlMaxAge: 60,
  });
  return blob.pathname;
}

async function getPrivateImage(pathname) {
  if (
    typeof pathname !== "string" ||
    !/^gallery\/[A-Za-z0-9_-]+\.webp$/.test(pathname)
  ) {
    return null;
  }
  return get(pathname, { access: "private", useCache: false });
}

async function deletePrivateImage(pathname) {
  if (
    typeof pathname !== "string" ||
    !/^gallery\/[A-Za-z0-9_-]+\.webp$/.test(pathname)
  ) {
    return;
  }
  await del(pathname);
}

module.exports = {
  deletePrivateImage,
  getPrivateImage,
  isConfigured,
  putPrivateImage,
};
