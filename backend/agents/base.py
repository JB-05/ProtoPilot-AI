"""
Base contract for pipeline agents. Every agent output is guilty until validated.
"""

from typing import Protocol, TypeVar

from pydantic import BaseModel

from orchestration.state import IdeaState

T = TypeVar("T", bound=BaseModel)


class BaseAgent(Protocol[T]):
    """Protocol for pipeline agents: output schema + process returning raw string (e.g. LLM JSON)."""

    output_schema: type[T]
    name: str

    def process(self, state: IdeaState) -> str:
        """Return raw agent output (e.g. JSON string). Caller will parse and validate."""
        ...
