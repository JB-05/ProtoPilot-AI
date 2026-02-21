"""
Pydantic models for request/response and pipeline data.
"""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "ok"


# --- Structured error response (validation & reliability layer) ---


class ErrorDetail(BaseModel):
    """Detail payload for structured errors."""

    code: str = Field(..., description="Error code (e.g. validation_error, pipeline_error)")
    message: str = Field(..., description="Human-readable message")
    agent_name: str | None = Field(None, description="Agent that failed, if applicable")
    details: dict[str, Any] = Field(default_factory=dict, description="Extra context (e.g. parse errors)")


class StructuredErrorResponse(BaseModel):
    """API response when pipeline or validation fails. Malformed output never breaks the system."""

    success: bool = False
    error: ErrorDetail = Field(..., description="Structured error detail")


# --- Agent output schemas (guilty until validated) ---

# Each agent output must conform to a schema. Add fields as needed when implementing LLM calls.


class AgentOutputBase(BaseModel):
    """Base for all agent outputs. Ensures a minimal valid structure."""

    content: str = Field(..., min_length=1, description="Primary output content")
    reasoning: str | None = Field(None, description="Optional reasoning or notes")

    class Config:
        extra = "forbid"  # Reject unknown keys from LLM output


class StrategistOutput(AgentOutputBase):
    """Schema enforced for Strategist agent output."""

    pass


class ArchitectOutput(AgentOutputBase):
    """Schema enforced for Architect agent output."""

    pass


class BusinessOutput(AgentOutputBase):
    """Schema enforced for Business agent output."""

    pass


class RiskOutput(AgentOutputBase):
    """Schema enforced for Risk agent output."""

    pass


class SprintTask(BaseModel):
    """Single task in a sprint."""

    title: str
    description: str | None = None
    task_type: str | None = None
    estimated_effort: str | None = None
    status: str = "todo"

    class Config:
        extra = "allow"


class SprintItem(BaseModel):
    """Sprint with tasks."""

    sprint_index: int
    name: str | None = None
    tasks: list[SprintTask] = []

    class Config:
        extra = "allow"


class ScrumOutput(AgentOutputBase):
    """Schema enforced for Scrum agent output. Optional sprints for DB persistence."""

    sprints: list[SprintItem] | None = None

    class Config:
        extra = "allow"
