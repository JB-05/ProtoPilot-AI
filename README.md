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
npm run dev
```

App: **http://localhost:3000**

> **Optional:** Set `NEXT_PUBLIC_API_URL` in `frontend/.env` if the backend runs elsewhere.

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
└── frontend/
    ├── app/                 # Next.js App Router
    ├── components/          # Dashboard, ArchitectureView, SprintBoard, RiskPanel
    └── lib/apiClient.ts     # API client
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

## ⚙️ Environment

| Variable | Where | Purpose |
|----------|-------|---------|
| `SUPABASE_URL` | Backend | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | Service role key (server-side only) |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend URL (default: `http://localhost:8000`) |

**Backend** (`backend/.env`):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Frontend** (`frontend/.env`, optional):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

See `.env.example` at the repo root for a template.

---

## 🗄️ Database schema (Supabase)

Create these tables in your Supabase project (SQL Editor):

```sql
-- ideas
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  problem_statement TEXT DEFAULT '',
  target_audience TEXT,
  key_features TEXT,
  budget TEXT,
  timeline TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- pipeline_runs
CREATE TABLE pipeline_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'running',
  model_config JSONB,
  total_latency_ms INTEGER,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- agent_outputs
CREATE TABLE agent_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_run_id UUID NOT NULL REFERENCES pipeline_runs(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  output_json JSONB NOT NULL,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- sprints
CREATE TABLE sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_run_id UUID NOT NULL REFERENCES pipeline_runs(id) ON DELETE CASCADE,
  sprint_index INTEGER NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT,
  estimated_effort TEXT,
  status TEXT DEFAULT 'todo',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: disable or add policies as needed for service role access
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
```

> **Note:** The backend uses the **service role key**, which bypasses RLS. For production, add policies or use a restricted key.

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
