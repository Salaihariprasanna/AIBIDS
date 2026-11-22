import pandas as pd
import numpy as np
from typing import Dict, Any, List
from sklearn.linear_model import LinearRegression
from app.services.data_service import data_service
from app.models.schemas import SimulationResult

class SimulatorService:
    """
    Simulates 'What-If' scenarios and estimates business KPI outcomes
    based on sensitivity elasticity coefficients.
    """
    
    def simulate_scenario(
        self,
        dataset_id: str,
        target_metric: str,
        driver_adjustments: Dict[str, float]
    ) -> SimulationResult:
        df = data_service.get_dataframe(dataset_id).copy()
        
        if target_metric not in df.columns or not pd.api.types.is_numeric_dtype(df[target_metric]):
            raise ValueError(f"Target metric '{target_metric}' must be a numeric column.")
            
        valid_drivers = [d for d in driver_adjustments.keys() if d in df.columns and pd.api.types.is_numeric_dtype(df[d])]
        if not valid_drivers:
            # Fallback: select other numeric columns
            num_cols = [c for c in df.select_dtypes(include=[np.number]).columns if c != target_metric]
            valid_drivers = num_cols[:3]
            
        clean_df = df.dropna(subset=[target_metric] + valid_drivers)
        if len(clean_df) < 5:
            raise ValueError("Insufficient data rows for scenario modeling.")
            
        X = clean_df[valid_drivers].values
        y = clean_df[target_metric].values
        
        model = LinearRegression()
        model.fit(X, y)
        
        baseline_val = float(y.mean())
        
        # Calculate adjusted input features
        base_features = clean_df[valid_drivers].mean().to_dict()
        adjusted_features = []
        
        for d in valid_drivers:
            adj = driver_adjustments.get(d, 0.0)
            base_f = base_features[d]
            adjusted_features.append(base_f * (1.0 + adj))
            
        simulated_val = float(model.predict([adjusted_features])[0])
        delta_val = round(simulated_val - baseline_val, 2)
        delta_pct = round((delta_val / max(abs(baseline_val), 1)) * 100, 2)
        
        # Calculate feature elasticity / key driver impact
        key_drivers = []
        for idx, d in enumerate(valid_drivers):
            coef = model.coef_[idx]
            adj = driver_adjustments.get(d, 0.0)
            driver_impact = coef * (base_features[d] * adj)
            key_drivers.append({
                "driver": d,
                "adjustment_pct": round(adj * 100, 1),
                "elasticity_coefficient": round(float(coef), 4),
                "estimated_impact": round(float(driver_impact), 2)
            })
            
        # Build sensitivity curve (-30% to +30% on primary driver)
        primary_driver = valid_drivers[0] if valid_drivers else None
        sensitivity_curve = []
        if primary_driver:
            for step_pct in range(-30, 35, 10):
                step_val = step_pct / 100.0
                test_f = list(base_features.values())
                test_f[0] = base_features[primary_driver] * (1.0 + step_val)
                pred_step = float(model.predict([test_f])[0])
                sensitivity_curve.append({
                    "adjustment_pct": f"{step_pct:+d}%",
                    "projected_metric": round(pred_step, 2)
                })
                
        # Prescription Narrative
        direction = "increase" if delta_val > 0 else "decrease" if delta_val < 0 else "maintain"
        narrative = (
            f"Under this scenario, {target_metric.replace('_', ' ')} is projected to {direction} "
            f"by {abs(delta_pct)}% (${abs(delta_val):,.2f}), moving from a baseline of "
            f"${baseline_val:,.2f} to ${simulated_val:,.2f}."
        )
        
        return SimulationResult(
            baseline_value=round(baseline_val, 2),
            simulated_value=round(simulated_val, 2),
            delta_value=delta_val,
            delta_percentage=delta_pct,
            key_drivers=key_drivers,
            prescription_narrative=narrative,
            sensitivity_curve=sensitivity_curve
        )

simulator_service = SimulatorService()
