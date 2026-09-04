<<<<<<< HEAD
# transformai-sih
=======
# TransformAI

TransformAI turns a single trusted source into audience-ready communications: an executive summary, advisory, LinkedIn post, and video-production package.

## Architecture

- `frontend/`: React + TypeScript dashboard and Supabase email authentication.
- `backend/`: FastAPI API, OpenAI orchestration (Phase 4), and project history endpoints.
- `supabase/`: PostgreSQL schema and row-level-security migration.
- `contracts/`: JSON contracts that generated artefacts must satisfy.

## Local setup

1. Create a Supabase project and enable **Email** authentication.
2. Copy `.env.example` values into `backend/.env` and `frontend/.env` as appropriate.
3. Apply `supabase/migrations/202609020001_initial_schema.sql` in the Supabase SQL Editor or with the Supabase CLI.
4. Start the API:

   ```bash
   cd backend
   python -m venv .venv
   .venv/Scripts/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

5. Start the web app in another terminal:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Open `http://localhost:5173`. The health endpoint is at `http://localhost:8000/health`.

## Required services

- OpenAI API project and server-side API key (needed in Phase 4 for generation).
- Supabase project for Auth, Postgres, and private file storage.

See [`docs/environment.md`](docs/environment.md) for the full environment contract.
>>>>>>> 826d33c (feat: complete TransformAI MVP with multi-source ingestion, 4 structured artefacts, grounding, and modern UI)
