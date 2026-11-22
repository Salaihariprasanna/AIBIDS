import time
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from app.core.database import db_manager
from app.core.security import SQLSecurityGuard
from app.models.schemas import ChartRecommendation

class SQLEngine:
    """
    Executes validated SQL queries against DuckDB and auto-generates
    chart recommendations & quick statistical insights.
    """
    
    @staticmethod
    def execute_and_analyze(sql: str, table_name: str) -> Dict[str, Any]:
        is_safe, message = SQLSecurityGuard.validate_sql(sql)
        if not is_safe:
            raise ValueError(f"Security Alert: {message}")
            
        start_time = time.time()
        try:
            df = db_manager.execute_query(sql)
        except Exception as e:
            raise RuntimeError(f"DuckDB Execution Error: {str(e)}")
            
        duration_ms = round((time.time() - start_time) * 1000, 2)
        
        # Determine chart recommendation
        chart_rec = SQLEngine._recommend_chart(df)
        insights = SQLEngine._generate_insights(df)
        
        # Clean for JSON serialization
        clean_df = df.replace({np.nan: None})
        records = clean_df.to_dict(orient="records")
        
        return {
            "data": records,
            "row_count": len(records),
            "columns": list(df.columns),
            "execution_time_ms": duration_ms,
            "chart": chart_rec,
            "insights": insights
        }
        
    @staticmethod
    def _recommend_chart(df: pd.DataFrame) -> Optional[ChartRecommendation]:
        if df.empty or len(df.columns) == 0:
            return None
            
        cols = list(df.columns)
        if len(cols) == 1:
            return ChartRecommendation(
                chart_type="table",
                title="Single Metric Output",
                description="Result contains a single aggregated scalar."
            )
            
        num_cols = list(df.select_dtypes(include=[np.number]).columns)
        non_num_cols = [c for c in cols if c not in num_cols]
        
        # Check for time/date column
        date_candidates = [c for c in non_num_cols if any(k in c.lower() for k in ['date', 'time', 'month', 'year', 'day', 'period'])]
        
        if date_candidates and num_cols:
            return ChartRecommendation(
                chart_type="line",
                x_axis=date_candidates[0],
                y_axis=num_cols[0],
                title=f"{num_cols[0].replace('_', ' ').title()} Over Time",
                description="Time series trend visualization."
            )
            
        if len(non_num_cols) >= 1 and len(num_cols) >= 1:
            cat_col = non_num_cols[0]
            val_col = num_cols[0]
            if len(df) <= 7:
                return ChartRecommendation(
                    chart_type="pie",
                    x_axis=cat_col,
                    y_axis=val_col,
                    title=f"Distribution of {val_col.replace('_', ' ').title()} by {cat_col.replace('_', ' ').title()}",
                    description="Proportional breakdown across categories."
                )
            else:
                return ChartRecommendation(
                    chart_type="bar",
                    x_axis=cat_col,
                    y_axis=val_col,
                    title=f"{val_col.replace('_', ' ').title()} by {cat_col.replace('_', ' ').title()}",
                    description="Comparative categorical ranking."
                )
                
        if len(num_cols) >= 2:
            return ChartRecommendation(
                chart_type="scatter",
                x_axis=num_cols[0],
                y_axis=num_cols[1],
                title=f"{num_cols[1].replace('_', ' ').title()} vs {num_cols[0].replace('_', ' ').title()}",
                description="Correlation & distribution comparison."
            )
            
        return ChartRecommendation(
            chart_type="table",
            title="Tabular Data View",
            description="Displaying raw structured records."
        )
        
    @staticmethod
    def _generate_insights(df: pd.DataFrame) -> List[str]:
        insights = []
        if df.empty:
            return ["No data returned for this query."]
            
        num_cols = list(df.select_dtypes(include=[np.number]).columns)
        non_num_cols = [c for c in df.columns if c not in num_cols]
        
        if num_cols and non_num_cols and len(df) > 1:
            val_col = num_cols[0]
            cat_col = non_num_cols[0]
            try:
                top_row = df.loc[df[val_col].idxmax()]
                bottom_row = df.loc[df[val_col].idxmin()]
                insights.append(f"Highest {val_col.replace('_', ' ')} is recorded by **{top_row[cat_col]}** ({top_row[val_col]:,.2f}).")
                insights.append(f"Lowest {val_col.replace('_', ' ')} is recorded by **{bottom_row[cat_col]}** ({bottom_row[val_col]:,.2f}).")
            except Exception:
                pass
                
        if len(df) == 1 and num_cols:
            val_col = num_cols[0]
            val = df[val_col].iloc[0]
            insights.append(f"The aggregated value for **{val_col.replace('_', ' ')}** is **{val:,.2f}**.")
            
        return insights

sql_engine = SQLEngine()
