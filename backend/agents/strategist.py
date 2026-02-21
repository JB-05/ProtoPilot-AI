"""
Strategist agent. Output is validated against StrategistOutput before use.
"""

from core.schemas import StrategistOutput
from orchestration.state import IdeaState


class Strategist:
    """Strategist agent. Returns raw JSON; pipeline validates against output_schema."""

    name = "strategist"
    output_schema = StrategistOutput

    def process(self, state: IdeaState) -> str:
        """Placeholder: return valid JSON. Replace with LLM call; output will be validated."""
        return '{"content": "Strategy placeholder", "reasoning": null}'
