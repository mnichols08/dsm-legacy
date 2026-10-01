# DSM Legacy

Node.js 22, Express, and EJS serve the existing frontend. The page can run without Postgres configured; database commands require a `DATABASE_URL` connection string for a PostgreSQL database.

## Local development

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`. Run the focused server and migration checks with `npm test`.

## Postgres setup

Set `DATABASE_URL` in the shell or Vercel environment before using the database commands. Run migrations before seeding:

```powershell
$env:DATABASE_URL = "postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
npm run db:migrate
npm run db:seed
```

The seed command inserts the current `data/site-content.json` into `site_content` only when that singleton row is absent. It never overwrites existing database content. `npm run db:rollback` reverses the latest migration.

To provision a moderator privately, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the environment and run `npm run admin:create`. Passwords must be 12-200 characters; the account is stored as a bcrypt hash. Do not commit credentials or put them in source control.

The community page accepts quote and wording submissions only when `DATABASE_URL` is configured and migrations plus the content seed have run. Submissions remain pending until a moderator signs in at `/admin` and reviews them. Approved quotes are published; approved wording is applied to allowlisted text fields with revision history. Image uploads are not enabled yet.
