# Supabase Setup — Phase 2

Complete this once before you run TransformAI locally.

1. Create a new project at [Supabase](https://supabase.com/dashboard).
2. In **Authentication → Providers → Email**, enable Email. For local development, turn off **Confirm email** temporarily; turn it back on before deployment.
3. In **Project Settings → API**, copy the Project URL, `anon` key, and `service_role` key.
4. In **Project Settings → Database**, copy the connection string and replace its prefix with `postgresql+psycopg://` for `DATABASE_URL`.
5. Open **SQL Editor**, paste and run [`202609020001_initial_schema.sql`](../supabase/migrations/202609020001_initial_schema.sql).
6. Create these files from their examples:

   - `backend/.env` from `backend/.env.example`
   - `frontend/.env` from `frontend/.env.example`

7. Put the Secret key only in `backend/.env`. Put the Publishable key only in `frontend/.env`.

## Expected result

The `projects` and `source_assets` tables should be visible in Supabase, row-level security should be on, and a private `source-assets` bucket should exist.

## Quick verification

Start both apps, create an account in the browser, sign in, create a project named `Phishing Defence Advisory`, refresh the page, and confirm it appears in **My projects**.
