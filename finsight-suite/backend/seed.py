import os
import random
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client

def seed():
    load_dotenv()
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    
    if url and key:
        supabase = create_client(url, key)
        print("Connected to Supabase")
    else:
        supabase = None
        print("Supabase credentials not found, generating local CSV only.")

    org_id = "org_1"
    if supabase:
        try:
            supabase.table('organizations').insert({
                'id': org_id, 'name': 'Acme Corp', 'fiscal_year_start': 4, 'currency': 'INR'
            }).execute()
        except Exception as e:
            print("Org insertion skipped or failed:", e)

    categories = [
        ('Marketing', 50000, 500000),
        ('Engineering', 100000, 800000),
        ('Sales', 80000, 600000),
        ('Operations', 60000, 400000),
        ('HR', 40000, 300000),
        ('Legal', 20000, 200000),
        ('R&D', 80000, 700000),
        ('Infrastructure', 50000, 350000),
        ('Customer Support', 30000, 250000),
        ('Admin', 20000, 150000)
    ]

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ml_data_dir = os.path.join(base_dir, 'ml_training', 'data')
    os.makedirs(ml_data_dir, exist_ok=True)
    csv_path = os.path.join(ml_data_dir, 'financial_data.csv')
    
    spend_records = []
    csv_records = []
    
    months = []
    for y in [2024, 2025]:
        for m in range(1, 13):
            months.append(f"{y}-{m:02d}")

    for cat_name, min_val, max_val in categories:
        for month in months:
            base = random.uniform(min_val, max_val)
            amount = base * random.uniform(0.8, 1.2)
            roi = random.uniform(0.5, 3.0)
            
            spend_records.append({
                'org_id': org_id,
                'category': cat_name,
                'period': month,
                'amount': amount,
                'actual_roi': roi
            })
            csv_records.append({
                'category': cat_name,
                'period': month,
                'amount': amount,
                'actual_roi': roi
            })

    if supabase:
        chunk_size = 100
        for i in range(0, len(spend_records), chunk_size):
            try:
                supabase.table('historical_spend').insert(spend_records[i:i+chunk_size]).execute()
            except Exception as e:
                pass
                
        priorities = [
            {'org_id': org_id, 'period': '2025-12', 'priority_name': 'Growth', 'weight': 30},
            {'org_id': org_id, 'period': '2025-12', 'priority_name': 'Profitability', 'weight': 25},
            {'org_id': org_id, 'period': '2025-12', 'priority_name': 'Innovation', 'weight': 20},
            {'org_id': org_id, 'period': '2025-12', 'priority_name': 'Efficiency', 'weight': 15},
            {'org_id': org_id, 'period': '2025-12', 'priority_name': 'Compliance', 'weight': 10},
        ]
        try:
            supabase.table('business_priorities').insert(priorities).execute()
        except: pass
        
        risks = []
        for i, m in enumerate(months[-6:]):
            risks.extend([
                {'org_id': org_id, 'period': m, 'indicator_type': 'liquidity', 'value': random.uniform(0.8, 2.5)},
                {'org_id': org_id, 'period': m, 'indicator_type': 'budget_variance', 'value': random.uniform(-15, 25)},
                {'org_id': org_id, 'period': m, 'indicator_type': 'vendor_concentration', 'value': random.uniform(20, 60)},
                {'org_id': org_id, 'period': m, 'indicator_type': 'forecast_deviation', 'value': random.uniform(5, 30)},
                {'org_id': org_id, 'period': m, 'indicator_type': 'volatility', 'value': random.uniform(10, 40)},
            ])
        try:
            supabase.table('risk_indicators').insert(risks).execute()
        except: pass
        
        try:
            supabase.table('ml_models').insert({
                'model_name': 'spend_forecaster',
                'version': '1.0.0',
                'is_active': True,
                'storage_path': 'ml-models/spend_forecast_model.pkl'
            }).execute()
        except: pass

    pd.DataFrame(csv_records).to_csv(csv_path, index=False)
    print(f"Saved {len(csv_records)} records to {csv_path}")

if __name__ == "__main__":
    seed()
