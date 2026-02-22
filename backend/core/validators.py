"""
Validation & reliability: JSON parsing guardrails and schema enforcement.
Every agent output is guilty until validated.
"""
from __future__ import annotations

import json
from typing import TypeVar

from pydantic import BaseModel, ValidationError as PydanticValidationError

from core.errors import ValidationError

T = TypeVar("T", bound=BaseModel)


def safe_parse_json(raw: str) -> dict | None:
    """
    Parse JSON with guardrails. Returns None on malformed input instead of raising.
    Prevents pipeline corruption from bad LLM output.
    """
    if not raw or not raw.strip():
        return None
    try:
        parsed = json.loads(raw)
        if not isinstance(parsed, dict):
            return None
        return parsed
    except (json.JSONDecodeError, TypeError):
        return None


def validate_agent_output(data: dict, schema: type[T], *, agent_name: str | None = None) -> T:
    """
    Validate parsed data against the agent's output schema.
    Raises ValidationError with structured details on failure.
    """
    try:
        return schema.model_validate(data)
    except PydanticValidationError as e:
        details = {"validation_errors": [err.get("msg", str(err)) for err in e.errors()]}
        raise ValidationError(
            "Agent output failed schema validation",
            agent_name=agent_name,
            details=details,
        ) from e
