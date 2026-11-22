import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, List
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import Ridge
from app.services.data_service import data_service
from app.models.schemas import ForecastResponse, AnomalyResponse

class MLService:
    """
    Predictive Machine Learning Service providing Time-Series Forecasting
    and Anomaly Detection.
    """
    
    def generate_forecast(
        self,
        dataset_id: str,
        date_column: str,
        metric_column: str,
        horizon_periods: int = 6,
        frequency: str = "M"
    ) -> ForecastResponse:
        df = data_service.get_dataframe(dataset_id).copy()
        
        if date_column not in df.columns or metric_column not in df.columns:
            raise ValueError(f"Columns '{date_column}' or '{metric_column}' not found.")
            
        # Parse dates and group by date
        df[date_column] = pd.to_datetime(df[date_column], errors='coerce')
        df = df.dropna(subset=[date_column, metric_column])
        
        # Resample / Aggregate
        aggregated = df.groupby(df[date_column].dt.to_period(frequency))[metric_column].sum().reset_index()
        aggregated[date_column] = aggregated[date_column].dt.to_timestamp()
        aggregated = aggregated.sort_values(date_column)
        
        if len(aggregated) < 3:
            raise ValueError("Insufficient time-series data points (need at least 3 periods).")
            
        # Prepare Regression Feature Matrix
        time_index = np.arange(len(aggregated)).reshape(-1, 1)
        y = aggregated[metric_column].values
        
        model = Ridge(alpha=1.0)
        model.fit(time_index, y)
        
        # Historical records
        historical = []
        for _, row in aggregated.iterrows():
            historical.append({
                "date": row[date_column].strftime("%Y-%m-%d"),
                "actual": round(float(row[metric_column]), 2)
            })
            
        # Extrapolate Future Periods
        future_indices = np.arange(len(aggregated), len(aggregated) + horizon_periods).reshape(-1, 1)
        future_preds = model.predict(future_indices)
        
        # Compute standard deviation of residuals for confidence bounds
        residuals = y - model.predict(time_index)
        std_err = float(np.std(residuals)) if len(residuals) > 1 else float(y.mean() * 0.1)
        
        last_date = aggregated[date_column].iloc[-1]
        forecast = []
        
        for idx, pred in enumerate(future_preds):
            if frequency == "M":
                fut_date = last_date + pd.DateOffset(months=idx + 1)
            elif frequency == "D":
                fut_date = last_date + pd.DateOffset(days=idx + 1)
            elif frequency == "W":
                fut_date = last_date + pd.DateOffset(weeks=idx + 1)
            else:
                fut_date = last_date + pd.DateOffset(years=idx + 1)
                
            pred_val = round(max(0.0, float(pred)), 2)
            upper_bound = round(pred_val + 1.96 * std_err, 2)
            lower_bound = round(max(0.0, pred_val - 1.96 * std_err), 2)
            
            forecast.append({
                "date": fut_date.strftime("%Y-%m-%d"),
                "forecast": pred_val,
                "upper_bound": upper_bound,
                "lower_bound": lower_bound
            })
            
        # Summary & Growth calculation
        base_val = y[-1]
        proj_val = future_preds[-1]
        growth_rate = round(((proj_val - base_val) / max(abs(base_val), 1)) * 100, 2)
        
        direction = "upward growth" if growth_rate > 0 else "downward contraction" if growth_rate < 0 else "neutral stability"
        trend_summary = (
            f"Model projects a {direction} of {abs(growth_rate)}% across the next "
            f"{horizon_periods} periods for metric '{metric_column}'."
        )
        
        return ForecastResponse(
            historical=historical,
            forecast=forecast,
            trend_summary=trend_summary,
            growth_rate_pct=growth_rate,
            confidence_interval=True
        )

    def detect_anomalies(
        self,
        dataset_id: str,
        metric_columns: List[str],
        contamination: float = 0.05
    ) -> AnomalyResponse:
        df = data_service.get_dataframe(dataset_id).copy()
        
        valid_cols = [c for c in metric_columns if c in df.columns and pd.api.types.is_numeric_dtype(df[c])]
        if not valid_cols:
            raise ValueError("No valid numerical columns provided for anomaly detection.")
            
        df_clean = df.dropna(subset=valid_cols)
        if len(df_clean) < 10:
            raise ValueError("Dataset requires at least 10 valid records for anomaly detection.")
            
        X = df_clean[valid_cols].values
        
        # Fit Isolation Forest
        iso = IsolationForest(contamination=contamination, random_state=42)
        predictions = iso.fit_predict(X)
        scores = iso.decision_function(X)
        
        df_clean["is_anomaly"] = predictions == -1
        df_clean["anomaly_score"] = scores
        
        anomalies_df = df_clean[df_clean["is_anomaly"]].sort_values("anomaly_score")
        
        # Extract feature variance/importance
        variances = {col: round(float(df_clean[col].var()), 2) for col in valid_cols}
        total_var = sum(variances.values()) or 1.0
        feature_importance = {col: round(var / total_var, 3) for col, var in variances.items()}
        
        anomalies_records = anomalies_df.head(20).replace({np.nan: None}).to_dict(orient="records")
        
        findings = [
            f"Detected {len(anomalies_df)} anomalies ({round(len(anomalies_df)/len(df_clean)*100, 1)}% of total records).",
            f"Key metrics driving variance: {', '.join([f'{k} ({v*100}%)' for k, v in sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:3]])}."
        ]
        
        return AnomalyResponse(
            total_anomalies=len(anomalies_df),
            anomalies=anomalies_records,
            feature_importance=feature_importance,
            summary_findings=findings
        )

ml_service = MLService()
