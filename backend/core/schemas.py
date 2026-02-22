"""
Pydantic models for request/response and pipeline data.
"""

from __future__ import annotations

from typing import Any, List, Optional

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "ok"


# --- Structured error response (validation & reliability layer) ---


class ErrorDetail(BaseModel):
    """Detail payload for structured errors."""

    code: str = Field(..., description="Error code (e.g. validation_error, pipeline_error)")
    message: str = Field(..., description="Human-readable message")
    agent_name: Optional[str] = Field(None, description="Agent that failed, if applicable")
    details: dict = Field(default_factory=dict, description="Extra context (e.g. parse errors)")


class StructuredErrorResponse(BaseModel):
    """API response when pipeline or validation fails. Malformed output never breaks the system."""

    success: bool = False
    error: ErrorDetail = Field(..., description="Structured error detail")


# --- Agent output schemas (guilty until validated) ---

# Each agent output must conform to a schema. Add fields as needed when implementing LLM calls.


class AgentOutputBase(BaseModel):
    """Base for all agent outputs. Ensures a minimal valid structure."""

    content: str = Field(..., min_length=1, description="Primary output content")
    reasoning: Optional[str] = Field(None, description="Optional reasoning or notes")

    class Config:
        extra = "forbid"  # Reject unknown keys from LLM output


# --- CTO / Business Strategy output (Strategist) ---


class EnhancedIdeaBlock(BaseModel):
    """Refined idea block from CTO Strategy agent."""

    problem: str = ""
    target_user: str = ""
    core_features: List[str] = []

    class Config:
        extra = "allow"


class MarketAnalysisBlock(BaseModel):
    """Market analysis from CTO Strategy agent."""

    competitors: List[str] = []
    market_gap: str = ""

    class Config:
        extra = "allow"


class BusinessModelBlock(BaseModel):
    """Business model from CTO Strategy agent."""

    revenue_streams: List[str] = []
    pricing_strategy: str = ""
    cost_structure: List[str] = []

    class Config:
        extra = "allow"


class RiskAnalysisBlock(BaseModel):
    """Risk analysis from CTO Strategy agent."""

    technical_risk: str = ""
    market_risk: str = ""
    regulatory_risk: str = ""

    class Config:
        extra = "allow"


class ArchitectureBlock(BaseModel):
    """Architecture recommendation from CTO Strategy agent."""

    frontend: str = "Next.js"
    backend: str = "FastAPI"
    database: str = "SQLite"
    justification: str = ""

    class Config:
        extra = "allow"


class CTOStrategyOutput(BaseModel):
    """Full CTO/Business Strategy agent output. Validated then merged into state."""

    enhanced_idea: EnhancedIdeaBlock
    market_analysis: MarketAnalysisBlock
    business_model: BusinessModelBlock
    risk_analysis: RiskAnalysisBlock
    architecture: ArchitectureBlock
    feasibility_score: int = Field(..., ge=0, le=100)

    class Config:
        extra = "allow"


class StrategistOutput(CTOStrategyOutput):
    """Strategist uses CTO/Business Strategy format. Alias for pipeline validation."""

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
    description: Optional[str] = None
    task_type: Optional[str] = None
    estimated_effort: Optional[str] = None
    status: str = "todo"

    class Config:
        extra = "allow"


class SprintItem(BaseModel):
    """Sprint with tasks."""

    sprint_index: int
    name: Optional[str] = None
    tasks: List[SprintTask] = []

    class Config:
        extra = "allow"


class ScrumOutput(AgentOutputBase):
    """Schema enforced for Scrum agent output. Optional sprints for DB persistence."""

    sprints: Optional[List[SprintItem]] = None

    class Config:
        extra = "allow"
