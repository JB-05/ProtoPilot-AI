"""
Architect agent. Output is validated against ArchitectOutput before use.
"""

from core.schemas import ArchitectOutput
from orchestration.state import IdeaState


class Architect:
    """Architect agent. Returns raw JSON; pipeline validates against output_schema."""

    name = "architect"
    output_schema = ArchitectOutput

    def process(self, state: IdeaState) -> str:
        """Placeholder: return valid JSON. Replace with LLM call; output will be validated."""
        return '{"content": "Architecture placeholder", "reasoning": null}'
