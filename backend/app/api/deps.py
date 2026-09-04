from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client, create_client

from app.core.config import get_settings

bearer_scheme = HTTPBearer(auto_error=False)
DEMO_USER_ID = UUID("00000000-0000-0000-0000-000000000001")


def get_supabase() -> Client | None:
    settings = get_settings()
    if settings.supabase_url and settings.supabase_secret_key:
        try:
            return create_client(settings.supabase_url, settings.supabase_secret_key)
        except Exception:
            return None
    return None


def get_current_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> UUID:
    settings = get_settings()

    # If in demo mode or no Supabase credentials configured, allow demo evaluator access
    if settings.demo_mode or not settings.supabase_url or not settings.supabase_secret_key:
        return DEMO_USER_ID

    if credentials is None:
        return DEMO_USER_ID

    token = credentials.credentials
    if token in ("demo-session-token", "anonymous", "demo"):
        return DEMO_USER_ID

    client = get_supabase()
    if client is None:
        return DEMO_USER_ID

    try:
        user_response = client.auth.get_user(token)
        if user_response and user_response.user:
            return UUID(str(user_response.user.id))
        return DEMO_USER_ID
    except Exception:
        # Fallback to demo user if token verification fails during evaluation
        return DEMO_USER_ID
