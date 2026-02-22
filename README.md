<p align="center">
  <img src="https://img.shields.io/badge/ProtoPilot_AI-v0.1.0-1a1a1a?style=for-the-badge" alt="ProtoPilot AI" />
</p>

<h1 align="center">ProtoPilot AI</h1>
<p align="center">
  <strong>Multi-agent product planning pipeline</strong> — transform ideas into strategy, architecture, sprints, and risk assessments.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-0.109+-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
</p>

---

## ✨ Features

- **Ideas → Strategy** — Enter a problem statement, target audience, and constraints
- **Multi-agent pipeline** — Five specialized agents: Strategist, Architect, Business, Risk, Scrum
- **Validated output** — Every agent output is validated before use; retries on failure
- **Sprint planning** — Auto-generated sprints and tasks from the Scrum agent
- **Run history** — Browse past pipeline runs and compare results
- **Save on blur** — State persists when you leave a field (no spam on every keystroke)
- **Authentication** — Email/password login and signup via Supabase Auth; session middleware; optional RLS for multi-tenant isolation
- **Structured errors** — Pipeline and request validation failures return consistent 422 responses with clear messages; backend logs pipeline failures for debugging

---

## 🛠 Tech stack

| Layer | Stack |
|-------|-------|
| **Backend** | Python, FastAPI, Uvicorn, Supabase REST |
| **Frontend** | Next.js 15, React 18, TypeScript |
| **Database** | Supabase (PostgreSQL) |

---

## 🚀 Quick start

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
```

Create `backend/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Run:

```bash
python main.py
```

API: **http://localhost:8000** · Docs: **http://localhost:8000/docs**

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local` (or `.env`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Run:

```bash
npm run dev
```

App: **http://localhost:3000** · Login: **/login** · Signup: **/signup** · Dashboard: **/dashboard**

> Use your Supabase project URL and **anon** (public) key for the frontend — not the service role key.

---

## 📁 Project structure

```
innovate26/
├── backend/
│   ├── main.py              # FastAPI app, lifespan, CORS, error handlers
│   ├── api/routes.py        # Ideas, projects, pipeline endpoints
│   ├── core/
│   │   ├── config.py        # Settings (Supabase URL/key)
│   │   ├── idea_store.py    # Ideas, runs, agent outputs, sprints, tasks
│   │   ├── supabase_client.py
│   │   ├── schemas.py       # Pydantic models for agent output
│   │   ├── validators.py    # JSON parse, schema validation
│   │   └── errors.py        # PipelineError, ValidationError
│   ├── agents/              # Strategist, Architect, Business, Risk, Scrum
│   └── orchestration/       # PipelineRunner, IdeaState, PipelineResult
│
├── frontend/
│   ├── app/                 # Next.js App Router
│   │   ├── login/           # Login page (email/password)
│   │   ├── signup/          # Signup page
│   │   └── dashboard/       # Main app (after login)
│   ├── components/          # Dashboard, ArchitectureView, SprintBoard, RiskPanel
│   ├── lib/
│   │   ├── apiClient.ts     # API client
│   │   └── supabase/        # Browser client, server client, session middleware
│   └── middleware.ts       # Session refresh (Supabase auth)
│
├── schema_supabase.sql      # Tables and indexes (run first)
├── supabase_auth_trigger.sql # Trigger: create public.users on signup (run second)
└── supabase_rls_policies.sql # Optional RLS for user-scoped data (run third)
```

---

## 🔌 API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/projects` | Create project |
| `GET` | `/api/projects` | List projects |
| `GET` | `/api/projects/{id}/state` | Latest state |
| `POST` | `/api/projects/{id}/state` | Save state |
| `POST` | `/api/pipeline/run` | Run multi-agent pipeline |
| `GET` | `/api/ideas/{id}/runs` | List pipeline runs |
| `GET` | `/api/ideas/{id}/sprints` | Sprints and tasks |

---

## 🔐 Authentication

Auth is handled by **Supabase Auth** on the frontend. The backend uses the **service role key** (server-side only) and does not yet verify JWTs or scope ideas by user; see `AUTH_AND_SCHEMA_REPORT.md` for next steps (e.g. protect dashboard, pass JWT to backend, filter by `user_id`).

### Frontend auth

| Item | Description |
|------|-------------|
| **Login** | Page at `/login`; form calls `supabase.auth.signInWithPassword` then redirects to `/dashboard` |
| **Signup** | Page at `/signup`; form calls `supabase.auth.signUp`; “Check your email” shown if confirmation is enabled |
| **Session** | `middleware.ts` calls `updateSession()` from `lib/supabase/middleware` to refresh the Supabase session on each request |
| **Clients** | `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server components); both use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

### Supabase setup (run in SQL Editor, in order)

1. **`schema_supabase.sql`** — Creates `public.users`, `ideas`, `pipeline_runs`, `agent_outputs`, `sprints`, `tasks`, `generated_files`, and indexes. Ideas reference `users(id)`; `users.id` matches `auth.users(id)`.
2. **`supabase_auth_trigger.sql`** — Trigger on `auth.users`: when a user signs up, a row is inserted into `public.users` (id, email, full_name, created_at).
3. **`supabase_rls_policies.sql`** (optional) — Enables RLS on `users`, `ideas`, and pipeline-related tables so that, when using the Supabase client with the anon key, users only see their own data. The backend service role bypasses RLS.

### Env vars (auth)

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend | Supabase project URL (e.g. `https://xxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend | Supabase **anon** (public) key for browser auth — do not use the service role key here |

---

## ⚙️ Environment

| Variable | Where | Purpose |
|----------|-------|---------|
| `SUPABASE_URL` | Backend | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | Service role key (server-side only; never expose in frontend) |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend URL (default: `http://localhost:8000`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend | Supabase project URL (for auth and optional direct client access) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend | Supabase anon (public) key for login/signup and session |

**Backend** (`backend/.env`):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Frontend** (`frontend/.env.local` or `frontend/.env`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

See `.env.example` at the repo root for a template.

---

## 🗄️ Database schema (Supabase)

Use the SQL files in the repo root and run them in the Supabase SQL Editor **in this order**:

1. **`schema_supabase.sql`** — Tables: `public.users` (linked to `auth.users`), `ideas` (with `user_id`), `pipeline_runs`, `agent_outputs`, `sprints`, `tasks`, `generated_files`, plus indexes.
2. **`supabase_auth_trigger.sql`** — Function and trigger so each new signup in `auth.users` gets a row in `public.users`.
3. **`supabase_rls_policies.sql`** (optional) — RLS policies so users only see their own ideas and pipeline data when using the anon key.

Summary of main tables:

| Table | Purpose |
|-------|---------|
| `public.users` | One row per auth user; `id` = `auth.users(id)`; created by trigger on signup. |
| `ideas` | Projects; `user_id` references `public.users(id)`. |
| `pipeline_runs` | One per pipeline execution; `idea_id` → `ideas(id)`. |
| `agent_outputs` | Per-agent JSON output per run. |
| `sprints` / `tasks` | Scrum output per run. |
| `generated_files` | Per-file generated content per run. |

> **Note:** The backend uses the **service role key**, which bypasses RLS. For production, run the RLS script and add dashboard protection + JWT → `user_id` wiring (see `AUTH_AND_SCHEMA_REPORT.md`).

---

## 🔄 Pipeline flow

```
Idea (input)
    ↓
Strategist  →  Architect  →  Business  →  Risk  →  Scrum
    ↓              ↓            ↓          ↓         ↓
product_model  arch_model  business   risk_model  sprints
```

Each agent output is validated and merged into state. Invalid output triggers retries (default: 3). Failures return structured 422 errors.

---

## 📜 License

Private / not specified.
