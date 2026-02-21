"""
Pipeline result type: success with state or failure with structured error.
Malformed LLM outputs never break the system—failures are captured here.
"""

from dataclasses import dataclass

from core.schemas import ErrorDetail

from orchestration.state import IdeaState


@dataclass
class PipelineResult:
    """Result of running the pipeline. Either success with state or failure with error."""

    success: bool
    state: IdeaState | None = None
    error: ErrorDetail | None = None

    @classmethod
    def ok(cls, state: IdeaState) -> "PipelineResult":
        return cls(success=True, state=state, error=None)

    @classmethod
    def fail(cls, error: ErrorDetail) -> "PipelineResult":
        return cls(success=False, state=None, error=error)
