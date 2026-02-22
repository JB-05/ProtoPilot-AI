"""
Generate minimal full-stack MVP (React Vite + FastAPI SQLite) from CTO summary via LLM.
Returns and optionally writes a files array; validates before use.
"""
from __future__ import annotations

import json
import os
import socket
import subprocess
import sys
from pathlib import Path
from typing import Any

from core.llm_client import generate as llm_generate


def _port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0


def start_generated_mvp_servers(output_dir: str) -> None:
    """Start generated MVP backend (8001) and frontend (5173) in background if ports are free."""
    base = Path(output_dir).resolve()
    backend_dir = base / "backend"
    frontend_dir = base / "frontend"
    if not backend_dir.is_dir() or not frontend_dir.is_dir():
        return
    for pkg in ("routers", "core"):
        init_file = backend_dir / pkg / "__init__.py"
        if init_file.parent.is_dir() and not init_file.exists():
            init_file.write_text("", encoding="utf-8")
    try:
        if not _port_in_use(8001):
            subprocess.Popen(
                [sys.executable, "-m", "uvicorn", "main:app", "--reload", "--port", "8001"],
                cwd=str(backend_dir),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True,
            )
        if not _port_in_use(5173):
            subprocess.Popen(
                "npm install && npm run dev",
                cwd=str(frontend_dir),
                shell=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True,
                env={**os.environ, "CI": "1"},
            )
    except Exception:
        pass

MVP_SYSTEM_PROMPT = """You are a senior full-stack engineer. Generate a minimal but fully functional full-stack MVP project as valid JSON only.

ARCHITECTURE STRUCTURE:

Frontend must follow this structure:
frontend/
  package.json
  index.html
  src/
    main.jsx
    App.jsx
    api/client.js
    components/
      ItemForm.jsx
      ItemList.jsx
    pages/Dashboard.jsx
    styles/global.css

Backend must follow this structure:
backend/
  main.py
  requirements.txt
  database.py
  models.py
  schemas.py
  routers/items.py
  core/config.py

JSON SAFETY RULES (CRITICAL — output must be parseable by Python json.loads()):
- Output must start with { and end with }.
- No markdown. No text outside JSON.
- All file contents must be valid JSON string values.
- Escape all double quotes properly (inside content use \\").
- Escape all backslashes properly.
- Prefer single quotes in JS/JSX.
- Output must be a single object with one key: "files" (array of { "path": string, "content": string }).
- Do not include trailing commas or comments in the JSON.

RULES:
- Keep total files under 17 (frontend + backend structure is 16 files).
- Code must be fully runnable. No placeholders.
- Backend must use FastAPI with APIRouter.
- Backend must enable CORS for http://localhost:5173.
- SQLite with SQLAlchemy.
- Base.metadata.create_all(engine) must run on startup.
- API prefix must be /api.
- Frontend must fetch from http://localhost:8001/api.
- Do not generate Docker.
- Do not generate Tailwind.
- Do not generate TypeScript.
- All dependencies used must be listed in requirements.txt and package.json."""

MVP_USER_TEMPLATE = """Project Specification:

Product: {enhanced_problem}

Target User: {target_user}

Core Features: {core_features}

Architecture: Frontend React (Vite), Backend FastAPI, Database SQLite.

Generate full project file array JSON in this format (no other keys, no trailing commas):

{{ "files": [ {{ "path": "frontend/package.json", "content": "..." }}, {{ "path": "backend/main.py", "content": "..." }} ] }}"""

MVP_REQUIRED_BACKEND_FILES = ["backend/main.py", "backend/requirements.txt"]
MVP_REQUIRED_FRONTEND_FILES = ["frontend/package.json", "frontend/src/App.jsx"]
MVP_MAX_FILES = 16
UNSAFE_PATTERNS = ["os.system", "subprocess.call", "eval(", "exec("]


def extract_json(text: str) -> str:
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("No JSON object boundaries found")
    return text[start : end + 1]


def _build_user_prompt(enhanced_problem: str, target_user: str, core_features: str) -> str:
    return MVP_USER_TEMPLATE.format(
        enhanced_problem=enhanced_problem or "Task management",
        target_user=target_user or "General users",
        core_features=core_features or "Create, list, update, delete items",
    )


def _check_safe_content(path: str, content: str) -> None:
    for pattern in UNSAFE_PATTERNS:
        if pattern in content:
            raise ValueError(f"Unsafe content in {path}: disallowed pattern '{pattern}'")


def validate_mvp_response(parsed: dict[str, Any]) -> list[dict[str, str]]:
    if "files" not in parsed:
        raise ValueError("Missing files array")
    files = parsed["files"]
    if not isinstance(files, list):
        raise ValueError("files must be an array")
    if len(files) > MVP_MAX_FILES:
        raise ValueError(f"Too many files (max {MVP_MAX_FILES})")
    for path in MVP_REQUIRED_BACKEND_FILES:
        if not any(isinstance(f, dict) and f.get("path") == path for f in files):
            raise ValueError(f"Missing required file: {path}")
    for path in MVP_REQUIRED_FRONTEND_FILES:
        if not any(isinstance(f, dict) and f.get("path") == path for f in files):
            raise ValueError(f"Missing required file: {path}")
    out = []
    for f in files:
        if not isinstance(f, dict) or "path" not in f or "content" not in f:
            raise ValueError("Each file must have path and content")
        path_str = str(f["path"])
        content_str = str(f.get("content", ""))
        _check_safe_content(path_str, content_str)
        out.append({"path": path_str, "content": content_str})
    return out


async def generate_mvp_files(
    enhanced_problem: str,
    target_user: str,
    core_features: str,
) -> list[dict[str, str]]:
    user_prompt = _build_user_prompt(enhanced_problem, target_user, core_features)
    mvp_key = (os.environ.get("OPENROUTER_MVP_KEY") or os.environ.get("OPENROUTER_API_KEY") or "").strip()
    if not mvp_key:
        raise RuntimeError("OpenRouter API key not set for MVP (OPENROUTER_MVP_KEY or OPENROUTER_API_KEY)")
    mvp_model = (os.environ.get("OPENROUTER_MVP_MODEL") or os.environ.get("OPENROUTER_MODEL") or "").strip() or "qwen/qwen3-32b"
    last_error: Exception | None = None
    for attempt in range(2):
        try:
            raw = await llm_generate(
                user_prompt,
                system_prompt=MVP_SYSTEM_PROMPT,
                max_tokens=4500,
                model=mvp_model,
                api_key=mvp_key,
            )
            print("RAW LLM OUTPUT START")
            print(raw)
            print("RAW LLM OUTPUT END")
            cleaned = extract_json(raw)
            parsed = json.loads(cleaned)
            return validate_mvp_response(parsed)
        except Exception as e:
            last_error = e
            continue
    raise ValueError(f"Failed after retries: {last_error}") if last_error else ValueError("Failed after retries")


def write_mvp_files(files: list[dict[str, str]], output_dir: str) -> str:
    base = Path(output_dir).resolve()
    base.mkdir(parents=True, exist_ok=True)
    for f in files:
        path = base / f["path"]
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(f["content"], encoding="utf-8")
    return str(base)
