"""
Multi-agent pipeline runner with validation and retry.
Every agent output is guilty until validated. Malformed output cannot break the system.
Persists via Supabase REST when supabase client and pipeline_run_id are provided.
"""

import time
from typing import Any

from agents.architect import Architect
from agents.business import Business
from agents.risk import Risk
from agents.scrum import Scrum
from agents.strategist import Strategist

from core.errors import ValidationError
from core.schemas import ErrorDetail, ScrumOutput
from core.validators import safe_parse_json, validate_agent_output

from core.idea_store import (
    create_sprint,
    create_task,
    store_agent_output,
    update_pipeline_run_completed,
    update_pipeline_run_status,
)

from orchestration.result import PipelineResult
from orchestration.state import IdeaState

DEFAULT_MAX_RETRIES = 3

AGENT_STATE_KEYS = {
    "strategist": "enhanced_idea",  # Refined idea from vague input
    "architect": "architecture_model",
    "business": "business_model",
    "risk": "risk_model",
    "scrum": "sprint_model",
}


def _merge_output_into_state(state: IdeaState, agent_name: str, output: dict[str, Any]) -> IdeaState:
    """Merge validated agent output into state for response."""
    key = AGENT_STATE_KEYS.get(agent_name)
    content = output.get("content", "")
    if key:
        return state.model_copy(update={key: content})
    return state


def _persist_sprints_from_scrum(supabase: Any, pipeline_run_id: str, output: ScrumOutput) -> None:
    """Create sprints and tasks via Supabase from validated scrum output."""
    if not output.sprints:
        return
    for si in output.sprints:
        sprint_id = create_sprint(supabase, pipeline_run_id, si.sprint_index, si.name)
        if sprint_id:
            for t in si.tasks:
                create_task(
                    supabase,
                    sprint_id,
                    title=t.title,
                    description=t.description,
                    task_type=t.task_type,
                    estimated_effort=t.estimated_effort,
                    status=t.status or "todo",
                )


class PipelineRunner:
    """Runs the agent pipeline in order. Validates each output; retries on invalid; returns structured failure on exhaustion."""

    def __init__(self, max_retries: int = DEFAULT_MAX_RETRIES):
        self._agents = (Strategist(), Architect(), Business(), Risk(), Scrum())
        self._max_retries = max_retries

    def run(
        self,
        state: IdeaState,
        *,
        supabase: Any = None,
        pipeline_run_id: str | None = None,
    ) -> PipelineResult:
        """Run each agent in sequence. Parse and validate every output; retry on invalid; return failure after max retries.
        When supabase and pipeline_run_id are provided, persist agent_outputs and sprints/tasks.
        """
        current = state
        start_ms = int(time.time() * 1000)
        for agent in self._agents:
            result = self._run_agent_with_retry(agent, current, supabase=supabase, pipeline_run_id=pipeline_run_id)
            if not result.success:
                if supabase and pipeline_run_id:
                    update_pipeline_run_status(supabase, pipeline_run_id, "failed")
                return result
            current = result.state
        if supabase and pipeline_run_id:
            total_ms = int(time.time() * 1000) - start_ms
            update_pipeline_run_completed(supabase, pipeline_run_id, status="completed", total_latency_ms=total_ms)
        return PipelineResult.ok(current)

    def _run_agent_with_retry(
        self,
        agent,
        state: IdeaState,
        *,
        supabase: Any = None,
        pipeline_run_id: str | None = None,
    ) -> PipelineResult:
        """Run one agent with retry-on-invalid-output."""
        last_error: ErrorDetail | None = None
        for attempt in range(1, self._max_retries + 1):
            raw = agent.process(state)
            parsed = safe_parse_json(raw)
            if parsed is None:
                last_error = ErrorDetail(
                    code="validation_error",
                    message="Agent output was not valid JSON",
                    agent_name=getattr(agent, "name", None),
                    details={"attempt": attempt, "max_retries": self._max_retries},
                )
                continue
            try:
                validated = validate_agent_output(
                    parsed, agent.output_schema, agent_name=getattr(agent, "name", None)
                )
            except ValidationError as e:
                last_error = ErrorDetail(
                    code=e.code,
                    message=e.message,
                    agent_name=e.agent_name,
                    details={**e.details, "attempt": attempt, "max_retries": self._max_retries},
                )
                continue
            merged = _merge_output_into_state(state, getattr(agent, "name", ""), parsed)
            if supabase and pipeline_run_id:
                store_agent_output(supabase, pipeline_run_id, getattr(agent, "name", ""), parsed)
                if getattr(agent, "name", "") == "scrum" and hasattr(validated, "sprints") and validated.sprints:
                    _persist_sprints_from_scrum(supabase, pipeline_run_id, validated)
            return PipelineResult.ok(merged)
        return PipelineResult.fail(last_error or ErrorDetail(code="pipeline_error", message="Unknown failure"))
