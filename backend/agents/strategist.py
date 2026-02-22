"""
Strategist agent: AI CTO and Business Strategy Engine.
Transforms raw startup ideas into structured, investment-grade JSON.
Output is validated against CTOStrategyOutput (StrategistOutput).
Calls OpenRouter (e.g. GPT-OSS-120B) when OPENROUTER_API_KEY is set; otherwise mock.
"""

from __future__ import annotations

import json
from typing import Any

from core.schemas import StrategistOutput
from core.validators import safe_parse_json, validate_agent_output
from orchestration.state import IdeaState

SYSTEM_PROMPT = """You are an AI CTO and Business Strategy Engine.

Your task is to transform raw startup ideas into structured, investment-grade technical and business analysis.

STRICT RULES:
- Return ONLY valid JSON.
- Do NOT include markdown.
- Do NOT include explanation text.
- Do NOT wrap output in code fences.
- Do NOT add commentary.
- Do not include trailing commas.
- Do not include comments.
- Do not include any keys outside the specified schema.
- All fields must be present.
- If a value is unknown, provide a logical approximation.
- Feasibility score must be an integer between 0 and 100.

Your reasoning must be internally consistent:
- Architecture must match complexity.
- Cost structure must match architecture.
- Risks must align with market and tech stack.
- Business model must align with target users.

Be concise but technically precise."""

CTO_REQUIRED_KEYS = [
    "enhanced_idea",
    "market_analysis",
    "business_model",
    "risk_analysis",
    "architecture",
    "feasibility_score",
]

USER_PROMPT_TEMPLATE = """Startup Idea:
Problem: {problem_statement}
Target Audience: {target_audience}
Core Features: {key_features}
Budget: {budget}
Timeline: {timeline}

Return JSON strictly in this format:

{{
  "enhanced_idea": {{
    "problem": "",
    "target_user": "",
    "core_features": []
  }},
  "market_analysis": {{
    "competitors": [],
    "market_gap": ""
  }},
  "business_model": {{
    "revenue_streams": [],
    "pricing_strategy": "",
    "cost_structure": []
  }},
  "risk_analysis": {{
    "technical_risk": "",
    "market_risk": "",
    "regulatory_risk": ""
  }},
  "architecture": {{
    "frontend": "Next.js",
    "backend": "FastAPI",
    "database": "SQLite",
    "justification": ""
  }},
  "feasibility_score": 0
}}"""


def _build_user_prompt(state: IdeaState) -> str:
    return USER_PROMPT_TEMPLATE.format(
        problem_statement=state.problem_statement or state.idea or "",
        target_audience=state.target_audience or "",
        key_features=state.key_features or "",
        budget=state.budget or "",
        timeline=state.timeline or "",
    )


def _mock_response(state: IdeaState) -> dict[str, Any]:
    """Return valid CTOStrategyOutput-shaped JSON from state. Replace with LLM call when API key is set."""
    problem = (state.problem_statement or state.idea or "").strip() or "To be defined"
    target = (state.target_audience or "").strip() or "To be defined"
    features_str = (state.key_features or "").strip()
    core_features = [f.strip() for f in features_str.split(",") if f.strip()] if features_str else []
    return {
        "enhanced_idea": {
            "problem": problem[:500] if problem else "To be defined",
            "target_user": target[:300] if target else "To be defined",
            "core_features": core_features[:10] if core_features else ["Core value proposition to be defined"],
        },
        "market_analysis": {
            "competitors": [],
            "market_gap": "Run with an LLM to generate market analysis.",
        },
        "business_model": {
            "revenue_streams": ["Subscription", "Usage-based"],
            "pricing_strategy": "Tiered pricing aligned with target audience.",
            "cost_structure": ["Infrastructure", "Development", "Operations"],
        },
        "risk_analysis": {
            "technical_risk": "Depends on stack and scale.",
            "market_risk": "Depends on competition and adoption.",
            "regulatory_risk": "Depends on sector and geography.",
        },
        "architecture": {
            "frontend": "Next.js",
            "backend": "FastAPI",
            "database": "SQLite",
            "justification": "Lightweight stack for MVP; scale database as needed.",
        },
        "feasibility_score": 65,
    }


class Strategist:
    """Strategist agent: CTO/Business Strategy Engine. Returns valid JSON; pipeline validates against output_schema."""

    name = "strategist"
    output_schema = StrategistOutput

    async def process(self, state: IdeaState) -> str:
        """Call LLM (OpenRouter) or mock; parse, guard, validate; return JSON string. Pipeline unchanged."""
        import os
        cto_key = (os.environ.get("OPENROUTER_CTO_KEY") or os.environ.get("OPENROUTER_API_KEY") or "").strip()
        if not cto_key:
            out = _mock_response(state)
            return json.dumps(out)

        user_prompt = _build_user_prompt(state)
        from core.llm_client import generate
        cto_model = (os.environ.get("OPENROUTER_CTO_MODEL") or os.environ.get("OPENROUTER_MODEL") or "").strip() or "openai/gpt-oss-120b"
        raw = await generate(user_prompt, system_prompt=SYSTEM_PROMPT, api_key=cto_key, model=cto_model)

        parsed = safe_parse_json(raw)
        if not parsed:
            raise ValueError("Invalid JSON from LLM")

        for key in CTO_REQUIRED_KEYS:
            if key not in parsed:
                raise ValueError(f"Missing key: {key}")

        validated = validate_agent_output(parsed, self.output_schema, agent_name=self.name)
        return json.dumps(validated.model_dump())
