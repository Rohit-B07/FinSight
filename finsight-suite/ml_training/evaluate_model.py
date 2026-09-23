import os
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def evaluate():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, 'models', 'spend_forecast_model.pkl')
    scaler_path = os.path.join(base_dir, 'models', 'scaler.pkl')
    data_path = os.path.join(base_dir, 'data', 'processed_features.csv')
    
    if not all(os.path.exists(p) for p in [model_path, scaler_path, data_path]):
        print("Missing required files (model, scaler, or data).")
        return
        
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    df = pd.read_csv(data_path)
    df['period_dt'] = pd.to_datetime(df['period'] + '-01')
    df = df.sort_values(by='period_dt').reset_index(drop=True)
    
    features = [
        'month', 'quarter', 'amount_lag_1', 'amount_lag_3',
        'rolling_3m_avg', 'rolling_6m_avg', 'roi_lag_1',
        'spend_ratio', 'mom_growth', 'category_encoded'
    ]
    target = 'amount'
    
    split_idx = int(len(df) * 0.8)
    test_df = df.iloc[split_idx:]
    
    X_test = test_df[features]
    y_test = test_df[target]
    
    X_test_scaled = scaler.transform(X_test)
    preds = model.predict(X_test_scaled)
    
    mae = mean_absolute_error(y_test, preds)
    rmse = mean_squared_error(y_test, preds, squared=False)
    r2 = r2_score(y_test, preds)
    
    non_zero = y_test != 0
    mape = np.mean(np.abs((y_test[non_zero] - preds[non_zero]) / y_test[non_zero])) * 100
    
    print("--- Evaluation Report ---")
    print(f"Test Samples: {len(test_df)}")
    print(f"MAE:  {mae:.2f}")
    print(f"RMSE: {rmse:.2f}")
    print(f"MAPE: {mape:.2f}%")
    print(f"R²:   {r2:.4f}")
    print("-------------------------")

if __name__ == "__main__":
    evaluate()
