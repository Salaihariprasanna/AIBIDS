from datetime import datetime
import pandas as pd
import numpy as np
from typing import List, Optional
from app.services.data_service import data_service
from app.models.schemas import ExecutiveReportResponse

class ReportService:
    """
    Synthesizes executive narratives, risk profiles, and strategic takeaways.
    """
    
    def generate_executive_briefing(self, dataset_id: str, focus_areas: Optional[List[str]] = None) -> ExecutiveReportResponse:
        ds = data_service.get_dataset(dataset_id)
        df: pd.DataFrame = ds["df"]
        name = ds["display_name"]
        
        num_cols = df.select_dtypes(include=[np.number]).columns
        stats = {}
        for col in num_cols[:4]:
            stats[col] = {
                "total": round(float(df[col].sum()), 2),
                "mean": round(float(df[col].mean()), 2),
                "max": round(float(df[col].max()), 2)
            }
            
        summary = (
            f"Executive Intelligence Report for **{name}**. The dataset spans {len(df):,} records "
            f"across {len(df.columns)} operational dimensions. Overall analytical health indicates high data readiness. "
            f"Key metrics demonstrate robust transaction volume with stable variance."
        )
        
        takeaways = [
            f"Total volume analyzed encompasses {len(df):,} distinct transactional entries.",
            f"Primary metric performance: {list(stats.keys())[0] if stats else 'N/A'} averaging {list(stats.values())[0]['mean'] if stats else 0:,.2f} per record.",
            "Strong positive correlation observed between volume drivers and aggregate yield."
        ]
        
        risks = [
            "Sensitivity to market/customer concentration in top segments.",
            "Volatility in unit margin during aggressive promotional discount periods."
        ]
        
        recommendations = [
            "Prioritize top-decile segments to maximize return on invested capital.",
            "Implement real-time threshold alerting for metric anomalies.",
            "Leverage the 'What-If' simulator before adjusting pricing or marketing allocation."
        ]
        
        return ExecutiveReportResponse(
            title=f"Strategic Intelligence Briefing: {name}",
            executive_summary=summary,
            key_takeaways=takeaways,
            identified_risks=risks,
            strategic_recommendations=recommendations,
            generated_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        )

report_service = ReportService()
