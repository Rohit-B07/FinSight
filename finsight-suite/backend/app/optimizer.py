import logging
import numpy as np
from scipy.optimize import minimize

logger = logging.getLogger(__name__)

def run_optimization(org_id: str, total_budget: float, period: str, scenario_type: str, supabase_client) -> list:
    logger.info(f"Starting optimization for org {org_id}, budget {total_budget}, scenario {scenario_type}")
    
    # 1. Fetch budget categories
    categories_res = supabase_client.table("budget_categories").select("*").eq("org_id", org_id).execute()
    categories = categories_res.data
    
    if not categories:
        return []

    # 2. Fetch historical spend (simplified - assume actual_roi is stored or derived)
    # Using a placeholder actual_roi for demonstration
    
    # 3. Fetch priorities
    priorities_res = supabase_client.table("business_priorities").select("*").eq("org_id", org_id).eq("period", period).execute()
    priorities = {p["priority_name"]: p["weight"] for p in priorities_res.data}
    
    # Prepare data for optimization
    n = len(categories)
    locked_indices = []
    bounds = []
    initial_guess = []
    rois = []
    
    for i, cat in enumerate(categories):
        # Default ROI if not available (ideally fetched from historical performance)
        base_roi = 1.05
        # Modulate ROI based on priorities if mapped (simplified mapping)
        priority_boost = priorities.get(cat.get("category_name"), 0) / 100.0
        roi = base_roi + priority_boost
        rois.append(roi)
        
        if cat.get("is_locked"):
            locked_indices.append(i)
            fixed_val = cat.get("current_budget", total_budget / n)
            bounds.append((fixed_val, fixed_val))
            initial_guess.append(fixed_val)
        else:
            min_s = cat.get("min_spend", 0)
            max_s = cat.get("max_spend", total_budget)
            bounds.append((min_s, max_s))
            initial_guess.append(max(min_s, total_budget / n))
            
    # Objective function
    # scenario weights
    if scenario_type == "aggressive":
        roi_weight = 1.0
        var_weight = 0.0
    elif scenario_type == "conservative":
        roi_weight = 0.3
        var_weight = 0.7
    else: # balanced
        roi_weight = 0.7
        var_weight = 0.3
        
    def objective(x):
        # Maximize ROI -> Minimize negative ROI
        total_roi = -np.dot(x, rois)
        # Minimize variance from initial (penalize large shifts if conservative)
        variance_penalty = np.sum((x - initial_guess)**2)
        
        return (roi_weight * total_roi) + (var_weight * (variance_penalty / total_budget))
        
    # Constraint: sum(x) == total_budget
    def constraint_sum(x):
        return np.sum(x) - total_budget
        
    constraints = [{'type': 'eq', 'fun': constraint_sum}]
    
    result = minimize(
        objective, 
        initial_guess, 
        method='SLSQP', 
        bounds=bounds,
        constraints=constraints
    )
    
    allocations = result.x if result.success else initial_guess
    
    recommendations = []
    for i, cat in enumerate(categories):
        recommended = float(allocations[i])
        current = cat.get("current_budget", 0)
        projected = recommended * rois[i]
        
        recommendations.append({
            "category_id": cat["id"],
            "category_name": cat["name"],
            "current_budget": current,
            "recommended_budget": recommended,
            "projected_impact": projected - recommended,
            "confidence": 0.85 if result.success else 0.50
        })
        
    logger.info(f"Optimization completed. Success: {result.success}")
    return recommendations
