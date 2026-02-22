"""
Strategist agent. Output is validated against StrategistOutput before use.
Produces enhanced_idea: a refined, structured version of a vague user input.
"""

import json

from core.schemas import StrategistOutput
from orchestration.state import IdeaState


class Strategist:
    """Strategist agent. Returns raw JSON; pipeline validates against output_schema."""

    name = "strategist"
    output_schema = StrategistOutput

    def process(self, state: IdeaState) -> str:
        """Placeholder: return valid JSON. Replace with LLM call to refine vague idea into enhanced idea; output will be validated."""
        raw = state.problem_statement or state.idea or ""
        if raw.strip():
            snippet = raw[:80] + ("..." if len(raw) > 80 else "")
            enhanced = f"Refined concept: {snippet} — Clear problem statement, target user segments, and core value proposition to be defined by LLM."
        else:
            enhanced = "Enter your idea above and run the pipeline to generate an enhanced, structured version."
        return json.dumps({"content": enhanced, "reasoning": None})
