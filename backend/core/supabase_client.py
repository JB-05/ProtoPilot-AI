"""
Supabase REST client. Used when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.
"""

from typing import Any

_supabase: Any = None


def init_supabase(url: str, key: str) -> Any:
    """Create and cache the Supabase client. Call from lifespan."""
    global _supabase
    if not url or not key:
        _supabase = None
        return None
    from supabase import create_client
    _supabase = create_client(url, key)
    return _supabase


def get_supabase() -> Any:
    """Return the cached Supabase client, or None if not configured."""
    return _supabase


def get_supabase_or_raise() -> Any:
    """Return the Supabase client. Raises RuntimeError if not configured (for use in dependencies)."""
    if _supabase is None:
        raise RuntimeError("Supabase not configured; set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
    return _supabase


def supabase_available() -> bool:
    """True if Supabase client is initialized."""
    return _supabase is not None
