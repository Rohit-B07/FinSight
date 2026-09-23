from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
from app.auth import get_current_user, require_admin
from app.supabase_client import get_service_client
from app.risk_scorer import calculate_risk_score

router = APIRouter(prefix="/risk", tags=["Risk"])

class IndicatorItem(BaseModel):
    indicator_type: str
    category: Optional[str] = None
    value: float
    period: str
    source: Optional[str] = None

class IngestRequest(BaseModel):
    indicators: List[IndicatorItem]

@router.get("/dashboard")
def get_dashboard(user: dict = Depends(get_current_user)):
    org_id = user.get("org_id")
    if not org_id:
        raise HTTPException(status_code=400, detail="User has no org_id")
        
    supabase = get_service_client()
    
    # Latest risk score
    score_res = supabase.table("risk_scores").select("*").eq("org_id", org_id).order("created_at", desc=True).limit(1).execute()
    latest_score = score_res.data[0] if score_res.data else None
    
    # Unacknowledged alerts count
    alerts_res = supabase.table("risk_alerts").select("id", count="exact").eq("org_id", org_id).eq("acknowledged", False).execute()
    unack_count = alerts_res.count if alerts_res.count is not None else 0
    
    # Latest indicators
    # Note: Complex grouping is limited in postgrest, we'll fetch recent and process in memory
    ind_res = supabase.table("risk_indicators").select("*").eq("org_id", org_id).order("created_at", desc=True).limit(50).execute()
    indicators_by_type = {}
    for ind in ind_res.data:
        t = ind["indicator_type"]
        if t not in indicators_by_type:
            indicators_by_type[t] = []
        if len(indicators_by_type[t]) < 5:
            indicators_by_type[t].append(ind)
            
    return {
        "latest_score": latest_score,
        "unacknowledged_alerts_count": unack_count,
        "latest_indicators": indicators_by_type
    }

@router.get("/alerts")
def get_alerts(
    severity: Optional[str] = None,
    acknowledged: bool = False,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: dict = Depends(get_current_user)
):
    org_id = user.get("org_id")
    if not org_id:
        raise HTTPException(status_code=400, detail="User has no org_id")
        
    supabase = get_service_client()
    query = supabase.table("risk_alerts").select("*, risk_indicators(*)").eq("org_id", org_id).eq("acknowledged", acknowledged)
    if severity:
        query = query.eq("severity", severity)
        
    res = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return res.data

@router.post("/indicators/ingest")
def ingest_indicators(request: IngestRequest, user: dict = Depends(require_admin)):
    # Rate limiting concept: In production, apply a rate limit decorator or middleware here
    org_id = user.get("org_id")
    if not org_id:
        raise HTTPException(status_code=400, detail="User has no org_id")
        
    supabase = get_service_client()
    
    records = [{
        "org_id": org_id,
        "indicator_type": i.indicator_type,
        "category": i.category,
        "value": i.value,
        "period": i.period,
        "source": i.source
    } for i in request.indicators]
    
    try:
        if records:
            supabase.table("risk_indicators").insert(records).execute()
            
        period = request.indicators[0].period if request.indicators else None
        
        alerts_generated = 0
        if period:
            result = calculate_risk_score(org_id, period, supabase)
            alerts_generated = result.get("alerts_generated", 0)
            
        return {"ingested": len(records), "alerts_generated": alerts_generated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str, user: dict = Depends(get_current_user)):
    org_id = user.get("org_id")
    supabase = get_service_client()
    
    # Ensure alert belongs to org
    check = supabase.table("risk_alerts").select("id").eq("id", alert_id).eq("org_id", org_id).execute()
    if not check.data:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    res = supabase.table("risk_alerts").update({"acknowledged": True}).eq("id", alert_id).execute()
    return res.data[0] if res.data else None
