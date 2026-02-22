"""
LLM client for AI pipeline. OpenRouter (e.g. GPT-OSS-120B) for structured JSON generation.
"""

from __future__ import annotations

import os
from typing import Optional

import httpx

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "openai/gpt-oss-120b"
DEFAULT_MAX_TOKENS = 4096


async def generate(
    user_prompt: str,
    *,
    system_prompt: Optional[str] = None,
    model: Optional[str] = None,
    max_tokens: int = DEFAULT_MAX_TOKENS,
    api_key: Optional[str] = None,
) -> str:
    """
    Call OpenRouter chat completions. Returns the assistant message content only.
    api_key: optional; if not set, uses OPENROUTER_API_KEY from env.
    model: optional; if not set, uses OPENROUTER_MODEL from env or default.
    """
    api_key = (api_key or os.environ.get("OPENROUTER_API_KEY", "")).strip()
    if not api_key:
        raise RuntimeError("OpenRouter API key not set (OPENROUTER_API_KEY or pass api_key)")

    model = (model or os.environ.get("OPENROUTER_MODEL", "")).strip() or DEFAULT_MODEL
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": user_prompt})

    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://protopilot-ai.local",
            },
            json={
                "model": model,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": 0.3,
            },
        )
        resp.raise_for_status()
        data = resp.json()
    choice = data.get("choices")
    if not choice:
        raise RuntimeError("OpenRouter returned no choices")
    content = choice[0].get("message", {}).get("content") or ""
    return content.strip()
