# Changelog

Notable changes to the DSM site are documented here.

## [0.1.0] - 2026-10-01

### Added

- Node.js 22 and an Express/EJS server foundation.
- Vercel function entry point, health endpoints, and a content API backed by the existing JSON content.
- Server tests for homepage rendering, API content, static assets, and private source data.

### Changed

- Serve the existing frontend assets from the backend while preserving their URLs.
- Load site content through `/api/content`.
- Make component readiness wait for component registration and initialize the app safely after loading.

This release establishes the serving foundation. User submissions, moderation, and image uploads are not included yet.
