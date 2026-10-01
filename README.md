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

The schema establishes submission, approval, admin-session, content-revision, and moderation-audit storage. Public submission routes, moderator sign-in, and upload handling are not enabled yet.
