"""
Structured errors for the validation and reliability layer.
Malformed or invalid agent outputs must not break the pipeline.
"""

from typing import Any


class PipelineError(Exception):
    """Raised when pipeline or an agent step fails after retries."""

    def __init__(
        self,
        message: str,
        *,
        code: str = "pipeline_error",
        agent_name: str | None = None,
        details: dict[str, Any] | None = None,
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.agent_name = agent_name
        self.details = details or {}


class ValidationError(PipelineError):
    """Raised when agent output fails schema or JSON validation."""

    def __init__(
        self,
        message: str,
        *,
        agent_name: str | None = None,
        details: dict[str, Any] | None = None,
    ):
        super().__init__(
            message,
            code="validation_error",
            agent_name=agent_name,
            details=details or {},
        )
