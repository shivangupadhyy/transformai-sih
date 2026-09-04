# Environment Variables

Copy `.env.example` to local environment files. Keep all secrets out of Git and out of the browser bundle.

| Variable | Used by | Required | Purpose |
|---|---|---|---|
| `OPENAI_API_KEY` | FastAPI | Yes | Server-side content transformation. |
| `OPENAI_MODEL` | FastAPI | Yes | Generation model identifier; set once per deployment. |
| `DATABASE_URL` | FastAPI | Yes | Supabase Postgres connection string, using the `postgresql+psycopg://` driver prefix. |
| `SUPABASE_URL` | FastAPI | Yes | Supabase project URL. |
| `SUPABASE_SECRET_KEY` | FastAPI | Yes | Server-side privileged key; never expose to React. |
| `FRONTEND_ORIGIN` | FastAPI | Yes | Exact allowed React origin for CORS. |
| `MAX_UPLOAD_MB` | FastAPI | No | Default `50`; absolute upload limit. |
| `VITE_SUPABASE_URL` | React | Yes | Public Supabase URL. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | React | Yes | Public browser authentication key. |
| `VITE_API_BASE_URL` | React | Yes | FastAPI public base URL. |

## Accounts needed before Phase 2

- OpenAI Platform project with billing enabled and an API key.
- Supabase project with email authentication, Postgres, and a private storage bucket.
- GitHub repository.
- Vercel account for frontend deployment and Render or Railway account for the API.
