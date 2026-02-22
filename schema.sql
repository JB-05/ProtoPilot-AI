-- =====================================================
-- ProtoPilot AI Database Schema
-- =====================================================

-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- IDEAS (Immutable Human Input)
-- =====================================================

CREATE TABLE IF NOT EXISTS ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    problem_statement TEXT NOT NULL,
    target_audience TEXT,
    key_features TEXT,
    budget TEXT,
    timeline TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ideas_user_id
ON ideas(user_id);

-- =====================================================
-- PIPELINE RUNS (System Backbone)
-- =====================================================

CREATE TABLE IF NOT EXISTS pipeline_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,

    status TEXT NOT NULL DEFAULT 'running',
    model_config JSONB,

    total_latency_ms INTEGER,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_pipeline_runs_idea_id
ON pipeline_runs(idea_id);

-- =====================================================
-- AGENT OUTPUTS (Cognitive Trace)
-- =====================================================

CREATE TABLE IF NOT EXISTS agent_outputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pipeline_run_id UUID NOT NULL REFERENCES pipeline_runs(id) ON DELETE CASCADE,

    agent_name TEXT NOT NULL,
    output_json JSONB NOT NULL,

    latency_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_outputs_run_id
ON agent_outputs(pipeline_run_id);

CREATE INDEX IF NOT EXISTS idx_agent_outputs_agent_name
ON agent_outputs(agent_name);

CREATE INDEX IF NOT EXISTS idx_agent_outputs_json
ON agent_outputs USING GIN (output_json);

-- =====================================================
-- SPRINTS (Execution Artifacts)
-- =====================================================

CREATE TABLE IF NOT EXISTS sprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pipeline_run_id UUID NOT NULL REFERENCES pipeline_runs(id) ON DELETE CASCADE,

    sprint_index INTEGER NOT NULL,
    name TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sprints_run_id
ON sprints(pipeline_run_id);

-- =====================================================
-- TASKS (Normalized Work Units)
-- =====================================================

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,

    title TEXT NOT NULL,
    description TEXT,
    task_type TEXT,
    estimated_effort TEXT,
    status TEXT DEFAULT 'todo',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_sprint_id
ON tasks(sprint_id);

-- =====================================================
-- GENERATED FILES (Lovable-style code generation)
-- =====================================================
-- Stores per-file generated code for each pipeline run.
-- Used by MVP/code-gen module for project structure and live preview.

CREATE TABLE IF NOT EXISTS generated_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pipeline_run_id UUID NOT NULL REFERENCES pipeline_runs(id) ON DELETE CASCADE,

    file_path TEXT NOT NULL,
    content TEXT NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(pipeline_run_id, file_path)
);

CREATE INDEX IF NOT EXISTS idx_generated_files_run_id
ON generated_files(pipeline_run_id);

CREATE INDEX IF NOT EXISTS idx_generated_files_path
ON generated_files(file_path);

-- =====================================================
-- END OF SCHEMA
-- =====================================================