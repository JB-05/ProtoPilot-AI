"""
Project state persistence spine. Long-lived projects and state revisions.
No ORM. Simple SQLAlchemy text queries. state_json is IdeaState-compatible; no schema rigidity.
"""

import json
from dataclasses import dataclass
from typing import Any

from sqlalchemy import text
from sqlalchemy.orm import Session


# ---------------------------------------------------------------------------
# If tables do not exist, run the following SQL (PostgreSQL). No migrations.
# ---------------------------------------------------------------------------
# CREATE TABLE IF NOT EXISTS projects (
#     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
#     created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
# );
# CREATE TABLE IF NOT EXISTS project_states (
#     id SERIAL PRIMARY KEY,
#     project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
#     state_json JSONB NOT NULL,
#     created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
# );
# CREATE INDEX IF NOT EXISTS idx_project_states_project_id ON project_states(project_id);
# CREATE INDEX IF NOT EXISTS idx_project_states_created_at ON project_states(project_id, created_at DESC);
# ---------------------------------------------------------------------------


@dataclass
class Project:
    """Project entity. NOT an ORM model."""

    id: str
    created_at: str


@dataclass
class ProjectState:
    """Single state revision. NOT an ORM model."""

    id: int
    project_id: str
    state_json: dict[str, Any]
    created_at: str


def create_project(session: Session) -> Project | None:
    """
    Create a new project. Returns Project with id (UUID) and created_at, or None if bind missing.
    """
    if session.get_bind() is None:
        return None
    r = session.execute(
        text(
            "INSERT INTO projects (created_at) VALUES (CURRENT_TIMESTAMP) "
            "RETURNING id::text, created_at::text"
        ),
    )
    row = r.fetchone()
    if row is None:
        return None
    session.commit()
    return Project(id=row[0], created_at=row[1])


def get_project_state(session: Session, project_id: str) -> ProjectState | None:
    """
    Return the latest state revision for the project, or None.
    """
    if session.get_bind() is None:
        return None
    r = session.execute(
        text(
            "SELECT id, project_id::text, state_json, created_at::text "
            "FROM project_states WHERE project_id = :project_id "
            "ORDER BY created_at DESC LIMIT 1"
        ),
        {"project_id": project_id},
    )
    row = r.fetchone()
    if row is None:
        return None
    sj = row[2]
    state_json = sj if isinstance(sj, dict) else {}
    return ProjectState(id=row[0], project_id=row[1], state_json=state_json, created_at=row[3])


def save_project_state(session: Session, project_id: str, state_json: dict[str, Any]) -> None:
    """
    Append a new state revision for the project. state_json stored as JSONB; no validation.
    """
    if session.get_bind() is None:
        return
    session.execute(
        text(
            "INSERT INTO project_states (project_id, state_json) VALUES (:project_id, :state_json::jsonb)"
        ),
        {"project_id": project_id, "state_json": __json_dumps(state_json)},
    )
    session.commit()


def __json_dumps(obj: dict[str, Any]) -> str:
    """Serialize dict to JSON string for PostgreSQL JSONB."""
    return json.dumps(obj)
