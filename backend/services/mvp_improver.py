"""
Improve or modify an existing MVP project via LLM. Accepts current files + user instruction; returns modified_files only.
"""
from __future__ import annotations

import json
import os
from typing import Any

from core.llm_client import generate as llm_generate

MVP_IMPROVE_SYSTEM_PROMPT = """You are a senior full-stack engineer improving an existing MVP project.

You will receive:
- The current full project file list (path + content).
- A user instruction describing a change or feature addition.

Your task:
Modify ONLY what is necessary to implement the requested change.

STRICT RULES:

- Return ONLY valid JSON.
- Do NOT include markdown.
- Do NOT include explanations.
- Do NOT include code fences.
- Output must start with { and end with }.
- Do not include text outside JSON.
- All file contents must be valid JSON string values.
- Escape all double quotes properly.
- Escape all backslashes properly.
- Prefer single quotes in JavaScript/JSX.
- Do not rewrite the entire project unless absolutely necessary.
- Modify only affected files.
- If a new file is required, include it.
- Keep architecture clean and consistent.

Return in this format:

{
  "modified_files": [
    { "path": "frontend/src/....", "content": "..." },
    { "path": "backend/....", "content": "..." }
  ]
}"""


def _extract_json(text: str) -> str:
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("No JSON object boundaries found")
    return text[start : end + 1]


def _build_user_prompt(files: list[dict[str, str]], instruction: str) -> str:
    lines = ["Current project files:\n"]
    for f in files:
        path = f.get("path", "")
        content = f.get("content", "")
        lines.append(f"--- FILE: {path} ---\n{content}\n")
    lines.append("\nUser instruction:\n")
    lines.append(instruction)
    return "\n".join(lines)


def _validate_modified_files(parsed: dict[str, Any]) -> list[dict[str, str]]:
    if "modified_files" not in parsed:
        raise ValueError("Missing modified_files array")
    modified = parsed["modified_files"]
    if not isinstance(modified, list):
        raise ValueError("modified_files must be an array")
    out = []
    for item in modified:
        if not isinstance(item, dict) or "path" not in item or "content" not in item:
            raise ValueError("Each modified file must have path and content")
        out.append({"path": str(item["path"]), "content": str(item.get("content", ""))})
    return out


async def improve_mvp_files(
    files: list[dict[str, str]],
    instruction: str,
) -> list[dict[str, str]]:
    """
    Call LLM with current files + instruction; parse and return modified_files only.
    Raises ValueError on parse/validation errors; RuntimeError if API key missing.
    """
    if not files:
        raise ValueError("files list cannot be empty")
    instruction = (instruction or "").strip()
    if not instruction:
        raise ValueError("instruction cannot be empty")

    api_key = (
        os.environ.get("OPENROUTER_MVP_KEY") or os.environ.get("OPENROUTER_API_KEY") or ""
    ).strip()
    if not api_key:
        raise RuntimeError(
            "OpenRouter API key not set for MVP (OPENROUTER_MVP_KEY or OPENROUTER_API_KEY)"
        )
    model = (
        os.environ.get("OPENROUTER_MVP_MODEL")
        or os.environ.get("OPENROUTER_MODEL")
        or ""
    ).strip() or "qwen/qwen3-32b"

    user_prompt = _build_user_prompt(files, instruction)
    raw = await llm_generate(
        user_prompt,
        system_prompt=MVP_IMPROVE_SYSTEM_PROMPT,
        max_tokens=6000,
        model=model,
        api_key=api_key,
    )
    cleaned = _extract_json(raw)
    parsed = json.loads(cleaned)
    return _validate_modified_files(parsed)
