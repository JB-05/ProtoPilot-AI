"""
Scrum agent. Output is validated against ScrumOutput before use.
Returns sprints with tasks for persistence to sprints/tasks tables.
"""

from core.schemas import ScrumOutput
from orchestration.state import IdeaState


class Scrum:
    """Scrum agent. Returns raw JSON; pipeline validates against output_schema."""

    name = "scrum"
    output_schema = ScrumOutput

    def process(self, state: IdeaState) -> str:
        """Placeholder: return valid JSON with sprints. Replace with LLM call; output will be validated."""
        idea = state.problem_statement or state.idea or ""
        return (
            '{"content": "Sprint plan for: '
            + (idea[:50] + "..." if len(idea) > 50 else idea or "New idea")
            + '", "reasoning": null, "sprints": ['
            '{"sprint_index": 1, "name": "Sprint 1", "tasks": ['
            '{"title": "Define MVP scope", "description": "Clarify core features", "task_type": "planning", "estimated_effort": "2h", "status": "todo"},'
            '{"title": "Set up project structure", "description": "Initialize repo and tooling", "task_type": "setup", "estimated_effort": "4h", "status": "todo"}'
            "]},"
            '{"sprint_index": 2, "name": "Sprint 2", "tasks": ['
            '{"title": "Implement core flow", "description": "Build main user journey", "task_type": "development", "estimated_effort": "8h", "status": "todo"}'
            "]}]}"
        )
