This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Database-backed practice workspace

Use Node.js 24 and Bun 1.4.5. Install dependencies and prepare a local SQLite database:

```sh
bun install --frozen-lockfile
npm run db:migrate
read -r -p 'Demo email: ' VERTIVET_SEED_EMAIL
read -r -s -p 'Demo password (12+ characters): ' VERTIVET_SEED_PASSWORD
printf '\n'
export VERTIVET_SEED_EMAIL VERTIVET_SEED_PASSWORD
npm run db:seed
unset VERTIVET_SEED_EMAIL VERTIVET_SEED_PASSWORD
npm run dev
```

Open `/practice` and sign in with clinic ID `demo-central` or `demo-north` and the credentials you supplied. Seed only development databases. The same demo user belongs to both clinics so you can switch clinics and verify that their records are separate.

SQLite files default to `.data/vertivet.sqlite3`. Set `VERTIVET_DB_PATH` to an absolute path on a persistent writable volume when the database must survive redeploys. For a deployment behind a reverse proxy, set `VERTIVET_ORIGIN` to the external HTTPS origin. Run migrations before starting the app.

- `server/practice/application` contains the use cases and persistence contract.
- `server/practice/infrastructure` implements the contract with Knex and SQLite migrations.
- `server/practice/graphql` exposes the use cases through the GraphQL schema. The Next.js route at `/api/graphql` is the HTTP and session-cookie adapter.
- `app/practice` is the frontend for staff sign-in, patient registration, and booking. The existing owner and clinical portals still use their existing REST contracts.

Run `npm run test:practice` to verify the GraphQL service and tenant constraints against an in-memory SQLite database.

A session belongs to a clinic membership. Tenant-owned records use composite keys and foreign keys, and the service derives the clinic from the authenticated session. The workspace loads 20 patients and 20 upcoming appointments per page. The appointment picker uses the current patient page. SQLite deployment assumes a single writable database volume.
