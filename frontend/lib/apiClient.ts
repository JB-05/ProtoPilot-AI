/**
 * Backend API client. Transport only; no client-side transformations.
 * Matches schema: ideas, pipeline_runs, agent_outputs, sprints, tasks.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function getHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/api/health`);
  return res.json();
}

// --- Pipeline: request/response types ---

export interface IdeaStatePayload {
  idea_id: string;
  idea?: string | null;
  problem_statement?: string | null;
  target_audience?: string | null;
  key_features?: string | null;
  budget?: string | null;
  timeline?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  task_type?: string | null;
  estimated_effort?: string | null;
  status: string;
}

export interface Sprint {
  id: string;
  sprint_index: number;
  name?: string | null;
  tasks: Task[];
}

/** State from backend (idea + pipeline run + agent outputs + sprints). */
export interface PipelineState {
  idea_id?: string | null;
  idea?: string | null;
  problem_statement?: string | null;
  target_audience?: string | null;
  key_features?: string | null;
  budget?: string | null;
  timeline?: string | null;
  enhanced_idea?: string | null;
  product_model?: string | null;
  architecture_model?: string | null;
  business_model?: string | null;
  risk_model?: string | null;
  sprint_model?: string | null;
  sprints?: Sprint[];
  pipeline_run_id?: string | null;
  pipeline_status?: string | null;
}

/** Structured error from backend (422). */
export interface ApiError {
  message: string;
  agent_name?: string | null;
  code?: string;
  details?: Record<string, unknown>;
}

export type PipelineRunResult =
  | { ok: true; state: PipelineState }
  | { ok: false; error: ApiError };

/**
 * POST /api/pipeline/run. Requires idea_id. Returns merged state.
 */
export async function runPipeline(payload: IdeaStatePayload): Promise<PipelineRunResult> {
  const res = await fetch(`${API_BASE}/api/pipeline/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    const state = (await res.json()) as PipelineState;
    return { ok: true, state };
  }

  if (res.status === 422) {
    let body: {
      success?: boolean;
      error?: { message?: string; agent_name?: string | null; code?: string; details?: Record<string, unknown> };
    };
    try {
      body = (await res.json()) as typeof body;
    } catch {
      body = {};
    }
    const err = body?.error;
    return {
      ok: false,
      error: {
        message: typeof err?.message === "string" ? err.message : "Validation failed",
        agent_name: err?.agent_name ?? null,
        code: err?.code,
        details: err?.details,
      },
    };
  }

  return {
    ok: false,
    error: {
      message: `Request failed (${res.status})`,
      agent_name: null,
    },
  };
}

// --- Project / Idea workspace ---

export interface Project {
  id: string;
  created_at: string;
  problem_statement?: string;
}

export interface PipelineRunSummary {
  id: string;
  idea_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  total_latency_ms: number | null;
}

export type ProjectCreateResult =
  | { ok: true; project: Project }
  | { ok: false; error: ApiError };

export type ProjectStateResult =
  | { ok: true; state: PipelineState | null }
  | { ok: false; error: ApiError };

export type ProjectSaveResult =
  | { ok: true }
  | { ok: false; error: ApiError };

export async function listProjects(): Promise<
  { ok: true; projects: Project[] } | { ok: false; error: ApiError }
> {
  const res = await fetch(`${API_BASE}/api/projects`);
  if (!res.ok) {
    return { ok: false, error: { message: `Request failed (${res.status})`, agent_name: null } };
  }
  const body = (await res.json()) as { projects: Project[] };
  return { ok: true, projects: body.projects ?? [] };
}

export async function getProjectRuns(ideaId: string): Promise<
  { ok: true; runs: PipelineRunSummary[] } | { ok: false; error: ApiError }
> {
  const res = await fetch(`${API_BASE}/api/ideas/${encodeURIComponent(ideaId)}/runs`);
  if (!res.ok) {
    return { ok: false, error: { message: `Request failed (${res.status})`, agent_name: null } };
  }
  const body = (await res.json()) as { runs: PipelineRunSummary[] };
  return { ok: true, runs: body.runs ?? [] };
}

export async function getProjectRunState(
  ideaId: string,
  runId: string
): Promise<{ ok: true; state: PipelineState } | { ok: false; error: ApiError }> {
  const res = await fetch(
    `${API_BASE}/api/ideas/${encodeURIComponent(ideaId)}/runs/${encodeURIComponent(runId)}`
  );
  if (!res.ok) {
    return { ok: false, error: { message: `Request failed (${res.status})`, agent_name: null } };
  }
  const state = (await res.json()) as PipelineState;
  return { ok: true, state };
}

export async function createProject(): Promise<ProjectCreateResult> {
  const res = await fetch(`${API_BASE}/api/projects`, { method: "POST" });
  if (!res.ok) {
    return { ok: false, error: { message: `Request failed (${res.status})`, agent_name: null } };
  }
  const project = (await res.json()) as Project;
  return { ok: true, project };
}

export async function getProjectState(projectId: string): Promise<ProjectStateResult> {
  const res = await fetch(`${API_BASE}/api/projects/${encodeURIComponent(projectId)}/state`);
  if (!res.ok) {
    return { ok: false, error: { message: `Request failed (${res.status})`, agent_name: null } };
  }
  const body = (await res.json()) as { state: PipelineState | null };
  return { ok: true, state: body.state ?? null };
}

export async function saveProjectState(
  projectId: string,
  stateJson: PipelineState | Record<string, unknown>
): Promise<ProjectSaveResult> {
  const res = await fetch(`${API_BASE}/api/projects/${encodeURIComponent(projectId)}/state`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state_json: stateJson }),
  });
  if (!res.ok) {
    return { ok: false, error: { message: `Request failed (${res.status})`, agent_name: null } };
  }
  return { ok: true };
}

/** Fetch sprints and tasks for an idea. */
export async function getSprints(ideaId: string): Promise<{ ok: true; sprints: Sprint[] } | { ok: false; error: ApiError }> {
  const res = await fetch(`${API_BASE}/api/ideas/${encodeURIComponent(ideaId)}/sprints`);
  if (!res.ok) {
    return { ok: false, error: { message: `Request failed (${res.status})`, agent_name: null } };
  }
  const body = (await res.json()) as { sprints: Sprint[] };
  return { ok: true, sprints: body.sprints ?? [] };
}

/** Empty state for new projects with no revisions. */
export const EMPTY_PROJECT_STATE: PipelineState = {
  idea_id: null,
  idea: null,
  problem_statement: null,
  target_audience: null,
  key_features: null,
  budget: null,
  timeline: null,
  enhanced_idea: null,
  product_model: null,
  architecture_model: null,
  business_model: null,
  risk_model: null,
  sprint_model: null,
  sprints: [],
};
