from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel, Field
from app.auth import get_current_user, require_admin
from app.supabase_client import get_service_client
from app.optimizer import run_optimization

router = APIRouter(prefix="/budget", tags=["Budget"])

class OptimizeRequest(BaseModel):
    total_budget: float
    period: str
    scenario_type: str = Field(default="balanced", pattern="^(conservative|balanced|aggressive)$")

class PriorityItem(BaseModel):
    priority_name: str
    weight: float

class PrioritiesRequest(BaseModel):
    period: str
    priorities: List[PriorityItem]

@router.post("/optimize")
def optimize_budget(request: OptimizeRequest, user: dict = Depends(get_current_user)):
    org_id = user.get("org_id")
    if not org_id:
        raise HTTPException(status_code=400, detail="User has no org_id")
    
    supabase = get_service_client()
    try:
        recommendations = run_optimization(
            org_id=org_id,
            total_budget=request.total_budget,
            period=request.period,
            scenario_type=request.scenario_type,
            supabase_client=supabase
        )
        
        # Save to database
        records = []
        for rec in recommendations:
            records.append({
                "org_id": org_id,
                "period": request.period,
                "category_id": rec["category_id"],
                "current_budget": rec["current_budget"],
                "recommended_budget": rec["recommended_budget"],
                "projected_impact": rec["projected_impact"],
                "confidence": rec["confidence"],
                "scenario_type": request.scenario_type
            })
        if records:
            supabase.table("budget_recommendations").insert(records).execute()
            
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations")
def get_recommendations(
    period: Optional[str] = None,
    scenario_type: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    org_id = user.get("org_id")
    if not org_id:
        raise HTTPException(status_code=400, detail="User has no org_id")
        
    supabase = get_service_client()
    query = supabase.table("budget_recommendations").select("*").eq("org_id", org_id)
    if period:
        query = query.eq("period", period)
    if scenario_type:
        query = query.eq("scenario_type", scenario_type)
        
    res = query.execute()
    return res.data

@router.post("/priorities")
def set_priorities(request: PrioritiesRequest, user: dict = Depends(require_admin)):
    org_id = user.get("org_id")
    if not org_id:
        raise HTTPException(status_code=400, detail="User has no org_id")
        
    total_weight = sum(p.weight for p in request.priorities)
    if not (99.0 <= total_weight <= 101.0):
        raise HTTPException(status_code=400, detail="Weights must sum to approximately 100")
        
    supabase = get_service_client()
    
    try:
        records = [{
            "org_id": org_id,
            "period": request.period,
            "priority_name": p.priority_name,
            "weight": p.weight
        } for p in request.priorities]
        
        # Upsert by org_id, period, priority_name
        res = supabase.table("business_priorities").upsert(
            records, on_conflict="org_id,period,priority_name"
        ).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
