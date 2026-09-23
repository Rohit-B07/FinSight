import logging
import json

logger = logging.getLogger(__name__)

WEIGHTS = {
    "liquidity": 0.25,
    "budget_variance": 0.25,
    "vendor_concentration": 0.15,
    "forecast_deviation": 0.20,
    "volatility": 0.15
}

def calculate_risk_score(org_id: str, period: str, supabase_client) -> dict:
    logger.info(f"Calculating risk score for org {org_id}, period {period}")
    
    # Fetch recent indicators
    res = supabase_client.table("risk_indicators").select("*").eq("org_id", org_id).eq("period", period).execute()
    indicators = res.data
    
    if not indicators:
        return {"composite_score": 0, "breakdown_json": {}, "severity": "low", "alerts_generated": 0}
        
    # Group by type and get latest
    latest_by_type = {}
    for ind in indicators:
        t = ind["indicator_type"]
        if t not in latest_by_type or ind["created_at"] > latest_by_type[t]["created_at"]:
            latest_by_type[t] = ind
            
    breakdown = {}
    composite_score = 0.0
    alerts_to_create = []
    
    for t, weight in WEIGHTS.items():
        if t in latest_by_type:
            val = latest_by_type[t]["value"]
            # Normalization logic (simplified, assuming values are 0-100 where higher is riskier)
            # In a real system, liquidity high is good, so we'd invert it. We'll simulate that:
            if t == "liquidity":
                normalized = max(0, 100 - val) # Assuming high liquidity is low risk
            else:
                normalized = min(100, max(0, val))
                
            breakdown[t] = normalized
            composite_score += normalized * weight
            
            if normalized > 80:
                alerts_to_create.append({
                    "org_id": org_id,
                    "indicator_id": latest_by_type[t]["id"],
                    "severity": "high",
                    "threshold_breached": f"{t} score {normalized:.1f} exceeds threshold 80",
                    "acknowledged": False
                })
        else:
            breakdown[t] = 0.0
            
    # Determine severity
    if composite_score >= 75:
        severity = "critical"
    elif composite_score >= 50:
        severity = "high"
    elif composite_score >= 25:
        severity = "medium"
    else:
        severity = "low"
        
    if composite_score > 70:
        alerts_to_create.append({
            "org_id": org_id,
            "severity": "critical",
            "threshold_breached": f"Composite risk score {composite_score:.1f} exceeds threshold 70",
            "acknowledged": False
        })
        
    # Save score
    supabase_client.table("risk_scores").insert({
        "org_id": org_id,
        "period": period,
        "composite_score": composite_score,
        "breakdown_json": json.dumps(breakdown),
        "severity": severity
    }).execute()
    
    # Save alerts
    if alerts_to_create:
        supabase_client.table("risk_alerts").insert(alerts_to_create).execute()
        
    return {
        "composite_score": composite_score,
        "breakdown_json": breakdown,
        "severity": severity,
        "alerts_generated": len(alerts_to_create)
    }
