"""
Pipeline state passed through the multi-agent pipeline.
Matches ideas table: problem_statement, target_audience, key_features, budget, timeline.
"""

from pydantic import BaseModel


class IdeaState(BaseModel):
    """State passed between agents. Extend with pipeline-specific fields."""

    idea_id: str | None = None
    idea: str | None = None  # shorthand for problem_statement (backward compat)
    problem_statement: str | None = None
    target_audience: str | None = None
    key_features: str | None = None
    budget: str | None = None
    timeline: str | None = None

    class Config:
        extra = "allow"
