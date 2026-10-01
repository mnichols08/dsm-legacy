require("dotenv/config");

const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const { createAdminRouter } = require("./routes/admin");
const { createSubmissionsRouter } = require("./routes/submissions");
const { getEditableFields } = require("./lib/content-fields");
const { getApprovedQuotes, getPublishedContent } = require("./lib/content-store");
const { getPool } = require("./lib/database");

const rootDirectory = __dirname;
const siteContent = JSON.parse(
  fs.readFileSync(
    path.join(rootDirectory, "data", "site-content.json"),
    "utf8",
  ),
);

function createApp({ poolProvider = getPool } = {}) {
  const app = express();
  app.set("trust proxy", process.env.VERCEL ? 1 : "loopback");
  app.set("views", path.join(rootDirectory, "views"));
  app.set("view engine", "ejs");
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null,
      },
    },
    strictTransportSecurity: process.env.NODE_ENV === "production" ? undefined : false,
  }));
  app.use(express.urlencoded({ extended: false, limit: "12kb" }));
  app.use(express.json({ limit: "12kb" }));
  app.use(cookieParser());

  for (const directory of ["css", "images", "js"]) {
    app.use(`/${directory}`, express.static(path.join(rootDirectory, directory)));
  }

  app.use("/api/submissions", createSubmissionsRouter({ poolProvider, siteContent }));
  app.use("/admin", createAdminRouter({ poolProvider, siteContent }));

  app.get("/health", (request, response) => {
    response.json({ status: "ok" });
  });

  app.get("/api/health", (request, response) => {
    response.json({ status: "ok" });
  });

  app.get("/api/content", async (request, response) => {
    response.json(await getPublishedContent(poolProvider, siteContent));
  });

  app.get("/", async (request, response) => {
    const [approvedQuotes, content] = await Promise.all([
      getApprovedQuotes(poolProvider),
      getPublishedContent(poolProvider, siteContent),
    ]);
    response.render("index", {
      pageTitle: "Diamond Star Motors: Automotive Legend",
      approvedQuotes,
      contentFields: getEditableFields(content),
    });
  });

  app.use((error, request, response, next) => {
    console.error("Request failed:", error.message);
    if (response.headersSent) return next(error);
    response.status(error.status || 500).json({ error: "The request could not be completed." });
  });

  app.use((request, response) => {
    response.status(404).send("Not found");
  });

  return app;
}

const app = createApp();

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`DSM site listening on http://localhost:${port}`);
  });
}

module.exports = app;
module.exports.createApp = createApp;
