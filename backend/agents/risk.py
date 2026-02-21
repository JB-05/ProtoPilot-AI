"""
Risk agent. Output is validated against RiskOutput before use.
"""

from core.schemas import RiskOutput
from orchestration.state import IdeaState


class Risk:
    """Risk agent. Returns raw JSON; pipeline validates against output_schema."""

    name = "risk"
    output_schema = RiskOutput

    def process(self, state: IdeaState) -> str:
        """Placeholder: return valid JSON. Replace with LLM call; output will be validated."""
        return '{"content": "Risk placeholder", "reasoning": null}'
