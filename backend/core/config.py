"""
Configuration. All env access for the app lives here; no os.environ elsewhere.
Uses Supabase REST API (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).
"""

import os


class Settings:
    """App settings. Supabase REST: url + service_role key. OpenRouter for LLM."""

    app_name: str = "ProtoPilot AI"
    debug: bool = False
    supabase_url: str = ""
    supabase_key: str = ""
    openrouter_api_key: str = ""
    openrouter_model: str = "openai/gpt-oss-120b"

    def __init__(self) -> None:
        self.supabase_url = os.environ.get("SUPABASE_URL", "").strip()
        self.supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
        self.openrouter_api_key = os.environ.get("OPENROUTER_API_KEY", "").strip()
        self.openrouter_model = os.environ.get("OPENROUTER_MODEL", "openai/gpt-oss-120b").strip() or "openai/gpt-oss-120b"

    @property
    def supabase_configured(self) -> bool:
        return bool(self.supabase_url and self.supabase_key)

    @property
    def openrouter_configured(self) -> bool:
        return bool(self.openrouter_api_key)


def get_settings() -> Settings:
    """Return app settings."""
    return Settings()
