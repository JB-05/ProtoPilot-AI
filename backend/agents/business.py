"""
Business agent. Output is validated against BusinessOutput before use.
"""

from core.schemas import BusinessOutput
from orchestration.state import IdeaState


class Business:
    """Business agent. Returns raw JSON; pipeline validates against output_schema."""

    name = "business"
    output_schema = BusinessOutput

    def process(self, state: IdeaState) -> str:
        """Placeholder: return valid JSON. Replace with LLM call; output will be validated."""
        return '{"content": "Business placeholder", "reasoning": null}'
