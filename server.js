const fs = require("node:fs");
const path = require("node:path");
const express = require("express");

const app = express();
const rootDirectory = __dirname;
const siteContent = JSON.parse(
  fs.readFileSync(
    path.join(rootDirectory, "data", "site-content.json"),
    "utf8",
  ),
);

app.set("views", path.join(rootDirectory, "views"));
app.set("view engine", "ejs");

for (const directory of ["css", "images", "js"]) {
  app.use(`/${directory}`, express.static(path.join(rootDirectory, directory)));
}

app.get("/health", (request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/health", (request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/content", (request, response) => {
  response.json(siteContent);
});

app.get("/", (request, response) => {
  response.render("index", {
    pageTitle: "Diamond Star Motors: Automotive Legend",
  });
});

app.use((request, response) => {
  response.status(404).send("Not found");
});

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`DSM site listening on http://localhost:${port}`);
  });
}

module.exports = app;
