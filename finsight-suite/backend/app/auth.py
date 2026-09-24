from fastapi import Depends, HTTPException, Request, status
from app.supabase_client import get_client
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)

def get_current_user(request: Request) -> dict:
    settings = get_settings()
    auth_header = request.headers.get("Authorization")
    
    # Check for missing or non-Bearer authorization header
    if not auth_header or not auth_header.startswith("Bearer "):
        if settings.DEMO_MODE_FALLBACK:
            return {
                "user_id": "demo-user-id",
                "email": "demo@finsight.local",
                "org_id": "demo-org",
                "role": "admin",
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )
    
    parts = auth_header.split(" ", 1)
    token = parts[1].strip() if len(parts) > 1 else ""
    
    # Handle demo tokens or dummy values
    if (not token or token in ("demo-token", "anonymous", "demo", "null", "undefined", "mock")) and settings.DEMO_MODE_FALLBACK:
        return {
            "user_id": "demo-user-id",
            "email": "demo@finsight.local",
            "org_id": "demo-org",
            "role": "admin",
        }

    supabase = get_client()
    if not supabase:
        if settings.DEMO_MODE_FALLBACK:
            return {
                "user_id": "demo-user-id",
                "email": "demo@finsight.local",
                "org_id": "demo-org",
                "role": "admin",
            }
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable",
        )
    
    try:
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            if settings.DEMO_MODE_FALLBACK:
                return {
                    "user_id": "demo-user-id",
                    "email": "demo@finsight.local",
                    "org_id": "demo-org",
                    "role": "admin",
                }
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
        
        user = user_response.user
        meta = user.user_metadata or {}
        return {
            "user_id": user.id,
            "email": user.email,
            "org_id": meta.get("org_id") or "demo-org",
            "role": meta.get("role", "admin"),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Supabase auth validation error: {e}")
        if settings.DEMO_MODE_FALLBACK:
            return {
                "user_id": "demo-user-id",
                "email": "demo@finsight.local",
                "org_id": "demo-org",
                "role": "admin",
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )

def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin" and not get_settings().DEMO_MODE_FALLBACK:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return user

