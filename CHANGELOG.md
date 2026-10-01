# Changelog

Notable changes to the DSM site are documented here.

## [0.3.0] - 2026-10-01

### Added

- Anonymous, rate-limited wording and quote submission endpoints with input bounds, a honeypot, and explicit quote publication consent.
- Provisioned moderator sign-in using bcrypt passwords, opaque hashed sessions, secure cookies, login rate limits, and CSRF tokens.
- A protected moderator queue with transactional approve/reject actions and audit records.
- Approved quote publishing and audited, allowlisted wording overrides.
- Responsive community contribution forms and moderation pages; removed unverifiable sample testimonials.
- Request security headers, migration support for session CSRF tokens, and integration tests for the text workflow.

Image submissions and live Postgres/Vercel deployment remain follow-up work.

## [0.2.0] - 2026-10-01

### Added

- Postgres connection pool and reversible migration commands.
- Persistence schema for initial site content, anonymous wording/quote/image submissions, admin sessions, approved content revisions, and moderation audit events.
- Idempotent import of the existing site content JSON and migration tests.
- Local Postgres setup instructions.

This release establishes database storage only. Public submissions, moderator sign-in, and image uploads are not enabled yet.

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
