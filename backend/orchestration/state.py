"""
Pipeline state passed through the multi-agent pipeline.
Matches ideas table: problem_statement, target_audience, key_features, budget, timeline.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class IdeaState(BaseModel):
    """State passed between agents. Extend with pipeline-specific fields."""

    idea_id: Optional[str] = None
    idea: Optional[str] = None  # shorthand for problem_statement (backward compat)
    problem_statement: Optional[str] = None
    target_audience: Optional[str] = None
    key_features: Optional[str] = None
    budget: Optional[str] = None
    timeline: Optional[str] = None
    enhanced_idea: Optional[str] = None  # Strategist output: refined idea from vague input

    class Config:
        extra = "allow"
