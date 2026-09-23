from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.auth import get_current_user, require_admin
from app.supabase_client import get_service_client
import app.ml_inference as ml_inference

router = APIRouter(prefix="/ml", tags=["ML"])

class ActivateModelRequest(BaseModel):
    version: str

@router.get("/predictions/{org_id}")
def get_predictions(org_id: str, user: dict = Depends(get_current_user)):
    user_org = user.get("org_id")
    if user_org != org_id:
        raise HTTPException(status_code=403, detail="Not authorized to access predictions for this org")
        
    supabase = get_service_client()
    res = supabase.table("ml_predictions").select("*").eq("org_id", org_id).order("created_at", desc=True).limit(10).execute()
    return res.data

@router.post("/models/activate")
def activate_model(request: ActivateModelRequest, user: dict = Depends(require_admin)):
    supabase = get_service_client()
    
    try:
        # Deactivate all
        supabase.table("ml_models").update({"is_active": False}).neq("version", "").execute()
        # Activate specific
        res = supabase.table("ml_models").update({"is_active": True}).eq("version", request.version).execute()
        
        if not res.data:
            raise HTTPException(status_code=404, detail="Model version not found")
            
        # Trigger reload in memory
        ml_inference.load_model(supabase)
        
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models")
def list_models(user: dict = Depends(get_current_user)):
    supabase = get_service_client()
    res = supabase.table("ml_models").select("version, metrics_json, is_active, trained_at").order("trained_at", desc=True).execute()
    return res.data
