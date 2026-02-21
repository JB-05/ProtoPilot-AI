"""
Idea, pipeline run, agent outputs, sprints, and tasks persistence via Supabase REST API.
Matches schema: users, ideas, pipeline_runs, agent_outputs, sprints, tasks.
"""

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any


@dataclass
class Idea:
    id: str
    user_id: str | None
    problem_statement: str
    target_audience: str | None
    key_features: str | None
    budget: str | None
    timeline: str | None
    created_at: str


@dataclass
class PipelineRun:
    id: str
    idea_id: str
    status: str
    model_config: dict | None
    total_latency_ms: int | None
    started_at: str
    completed_at: str | None


@dataclass
class AgentOutput:
    id: str
    pipeline_run_id: str
    agent_name: str
    output_json: dict
    latency_ms: int | None
    created_at: str


@dataclass
class Sprint:
    id: str
    pipeline_run_id: str
    sprint_index: int
    name: str | None
    created_at: str


@dataclass
class Task:
    id: str
    sprint_id: str
    title: str
    description: str | None
    task_type: str | None
    estimated_effort: str | None
    status: str
    created_at: str


def _row_idea(row: dict[str, Any]) -> Idea:
    return Idea(
        id=str(row["id"]),
        user_id=str(row["user_id"]) if row.get("user_id") else None,
        problem_statement=row.get("problem_statement") or "",
        target_audience=row.get("target_audience"),
        key_features=row.get("key_features"),
        budget=row.get("budget"),
        timeline=row.get("timeline"),
        created_at=str(row.get("created_at", "")),
    )


def _row_pipeline_run(row: dict[str, Any]) -> PipelineRun:
    return PipelineRun(
        id=str(row["id"]),
        idea_id=str(row["idea_id"]),
        status=row.get("status", ""),
        model_config=row.get("model_config") if isinstance(row.get("model_config"), dict) else None,
        total_latency_ms=row.get("total_latency_ms"),
        started_at=str(row.get("started_at", "")),
        completed_at=str(row["completed_at"]) if row.get("completed_at") else None,
    )


def _row_agent_output(row: dict[str, Any]) -> AgentOutput:
    oj = row.get("output_json")
    return AgentOutput(
        id=str(row["id"]),
        pipeline_run_id=str(row["pipeline_run_id"]),
        agent_name=row.get("agent_name", ""),
        output_json=oj if isinstance(oj, dict) else {},
        latency_ms=row.get("latency_ms"),
        created_at=str(row.get("created_at", "")),
    )


def _row_sprint(row: dict[str, Any]) -> Sprint:
    return Sprint(
        id=str(row["id"]),
        pipeline_run_id=str(row["pipeline_run_id"]),
        sprint_index=int(row.get("sprint_index", 0)),
        name=row.get("name"),
        created_at=str(row.get("created_at", "")),
    )


def _row_task(row: dict[str, Any]) -> Task:
    return Task(
        id=str(row["id"]),
        sprint_id=str(row["sprint_id"]),
        title=row.get("title", ""),
        description=row.get("description"),
        task_type=row.get("task_type"),
        estimated_effort=row.get("estimated_effort"),
        status=row.get("status", "todo"),
        created_at=str(row.get("created_at", "")),
    )


def create_idea(
    supabase: Any,
    *,
    user_id: str | None = None,
    problem_statement: str = "",
    target_audience: str | None = None,
    key_features: str | None = None,
    budget: str | None = None,
    timeline: str | None = None,
) -> Idea | None:
    if supabase is None:
        return None
    payload: dict[str, Any] = {
        "problem_statement": problem_statement or "",
        "target_audience": target_audience,
        "key_features": key_features,
        "budget": budget,
        "timeline": timeline,
    }
    if user_id is not None:
        payload["user_id"] = user_id
    r = supabase.table("ideas").insert(payload).execute()
    if not r.data or len(r.data) == 0:
        return None
    return _row_idea(r.data[0])


def get_idea(supabase: Any, idea_id: str) -> Idea | None:
    if supabase is None:
        return None
    r = supabase.table("ideas").select("*").eq("id", idea_id).limit(1).execute()
    if not r.data or len(r.data) == 0:
        return None
    return _row_idea(r.data[0])


def update_idea(
    supabase: Any,
    idea_id: str,
    *,
    problem_statement: str | None = None,
    target_audience: str | None = None,
    key_features: str | None = None,
    budget: str | None = None,
    timeline: str | None = None,
) -> None:
    if supabase is None:
        return
    updates: dict[str, Any] = {}
    if problem_statement is not None:
        updates["problem_statement"] = problem_statement
    if target_audience is not None:
        updates["target_audience"] = target_audience
    if key_features is not None:
        updates["key_features"] = key_features
    if budget is not None:
        updates["budget"] = budget
    if timeline is not None:
        updates["timeline"] = timeline
    if not updates:
        return
    supabase.table("ideas").update(updates).eq("id", idea_id).execute()


def create_pipeline_run(supabase: Any, idea_id: str, model_config: dict | None = None) -> str | None:
    if supabase is None:
        return None
    payload: dict[str, Any] = {"idea_id": idea_id, "status": "running"}
    if model_config:
        payload["model_config"] = model_config
    r = supabase.table("pipeline_runs").insert(payload).execute()
    if not r.data or len(r.data) == 0:
        return None
    return str(r.data[0]["id"])


def update_pipeline_run_completed(supabase: Any, run_id: str, status: str = "completed", total_latency_ms: int | None = None) -> None:
    if supabase is None:
        return
    updates: dict[str, Any] = {
        "status": status,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }
    if total_latency_ms is not None:
        updates["total_latency_ms"] = total_latency_ms
    supabase.table("pipeline_runs").update(updates).eq("id", run_id).execute()


def update_pipeline_run_status(supabase: Any, run_id: str, status: str) -> None:
    if supabase is None:
        return
    supabase.table("pipeline_runs").update({"status": status}).eq("id", run_id).execute()


def store_agent_output(
    supabase: Any,
    pipeline_run_id: str,
    agent_name: str,
    output_json: dict,
    latency_ms: int | None = None,
) -> None:
    if supabase is None:
        return
    payload: dict[str, Any] = {
        "pipeline_run_id": pipeline_run_id,
        "agent_name": agent_name,
        "output_json": output_json,
    }
    if latency_ms is not None:
        payload["latency_ms"] = latency_ms
    supabase.table("agent_outputs").insert(payload).execute()


def get_ideas_list(supabase: Any, limit: int = 50) -> list[Idea]:
    """List ideas (projects) ordered by created_at desc."""
    if supabase is None:
        return []
    r = (
        supabase.table("ideas")
        .select("id, user_id, problem_statement, target_audience, key_features, budget, timeline, created_at")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    if not r.data:
        return []
    return [_row_idea(row) for row in r.data]


def get_pipeline_runs_for_idea(supabase: Any, idea_id: str, limit: int = 50) -> list[PipelineRun]:
    """List pipeline runs for an idea, ordered by started_at desc."""
    if supabase is None:
        return []
    r = (
        supabase.table("pipeline_runs")
        .select("*")
        .eq("idea_id", idea_id)
        .order("started_at", desc=True)
        .limit(limit)
        .execute()
    )
    if not r.data:
        return []
    return [_row_pipeline_run(row) for row in r.data]


def get_pipeline_run(supabase: Any, run_id: str) -> PipelineRun | None:
    """Get a single pipeline run by id."""
    if supabase is None:
        return None
    r = supabase.table("pipeline_runs").select("*").eq("id", run_id).limit(1).execute()
    if not r.data or len(r.data) == 0:
        return None
    return _row_pipeline_run(r.data[0])


def get_latest_pipeline_run_for_idea(supabase: Any, idea_id: str) -> PipelineRun | None:
    if supabase is None:
        return None
    r = (
        supabase.table("pipeline_runs")
        .select("*")
        .eq("idea_id", idea_id)
        .order("started_at", desc=True)
        .limit(1)
        .execute()
    )
    if not r.data or len(r.data) == 0:
        return None
    return _row_pipeline_run(r.data[0])


def get_agent_outputs_for_run(supabase: Any, pipeline_run_id: str) -> list[AgentOutput]:
    if supabase is None:
        return []
    r = (
        supabase.table("agent_outputs")
        .select("*")
        .eq("pipeline_run_id", pipeline_run_id)
        .order("created_at")
        .execute()
    )
    if not r.data:
        return []
    return [_row_agent_output(row) for row in r.data]


def create_sprint(supabase: Any, pipeline_run_id: str, sprint_index: int, name: str | None = None) -> str | None:
    if supabase is None:
        return None
    payload: dict[str, Any] = {"pipeline_run_id": pipeline_run_id, "sprint_index": sprint_index, "name": name or ""}
    r = supabase.table("sprints").insert(payload).execute()
    if not r.data or len(r.data) == 0:
        return None
    return str(r.data[0]["id"])


def create_task(
    supabase: Any,
    sprint_id: str,
    *,
    title: str,
    description: str | None = None,
    task_type: str | None = None,
    estimated_effort: str | None = None,
    status: str = "todo",
) -> None:
    if supabase is None:
        return
    payload: dict[str, Any] = {
        "sprint_id": sprint_id,
        "title": title,
        "description": description or "",
        "task_type": task_type,
        "estimated_effort": estimated_effort,
        "status": status,
    }
    supabase.table("tasks").insert(payload).execute()


def get_sprints_for_run(supabase: Any, pipeline_run_id: str) -> list[Sprint]:
    if supabase is None:
        return []
    r = (
        supabase.table("sprints")
        .select("*")
        .eq("pipeline_run_id", pipeline_run_id)
        .order("sprint_index")
        .execute()
    )
    if not r.data:
        return []
    return [_row_sprint(row) for row in r.data]


def get_tasks_for_sprint(supabase: Any, sprint_id: str) -> list[Task]:
    if supabase is None:
        return []
    r = supabase.table("tasks").select("*").eq("sprint_id", sprint_id).order("created_at").execute()
    if not r.data:
        return []
    return [_row_task(row) for row in r.data]
