import pandas as pd
import numpy as np
from typing import Dict, Any, List
from app.services.data_service import data_service
from app.models.schemas import EDAResponse, ColumnStats, DataHealthScore

class EDAService:
    """
    Automated Exploratory Data Analysis (AutoEDA) service.
    Generates data profiling, health scoring, correlations, and distribution metrics.
    """
    
    def generate_eda(self, dataset_id: str) -> EDAResponse:
        ds_info = data_service.get_dataset(dataset_id)
        df: pd.DataFrame = ds_info["df"]
        
        total_rows = len(df)
        total_columns = len(df.columns)
        memory_kb = round(df.memory_usage(deep=True).sum() / 1024, 2)
        
        column_stats_list: List[ColumnStats] = []
        issues = []
        recommendations = []
        
        null_counts_total = df.isnull().sum().sum()
        total_cells = total_rows * total_columns if total_rows * total_columns > 0 else 1
        completeness = round((1 - (null_counts_total / total_cells)) * 100, 2)
        
        dup_rows = df.duplicated().sum()
        uniqueness = round((1 - (dup_rows / max(total_rows, 1))) * 100, 2)
        
        if dup_rows > 0:
            issues.append(f"Found {dup_rows} duplicate rows ({round(dup_rows/total_rows*100, 1)}% of dataset).")
            recommendations.append("Consider deduplicating records before running predictive models.")
            
        health_penalty = 0
        
        for col in df.columns:
            s = df[col]
            null_cnt = int(s.isnull().sum())
            null_pct = round((null_cnt / max(total_rows, 1)) * 100, 2)
            unique_cnt = int(s.nunique())
            dtype_str = str(s.dtype)
            
            if null_pct > 25:
                issues.append(f"Column '{col}' has high missingness ({null_pct}% missing).")
                health_penalty += 5
                
            top_vals = []
            if unique_cnt > 0:
                top_s = s.value_counts(dropna=True).head(5)
                top_vals = [{"value": str(k), "count": int(v)} for k, v in top_s.items()]
                
            c_stat = ColumnStats(
                name=col,
                dtype=dtype_str,
                non_null_count=int(s.count()),
                null_count=null_cnt,
                null_percentage=null_pct,
                unique_count=unique_cnt,
                top_values=top_vals
            )
            
            if pd.api.types.is_numeric_dtype(s):
                valid_num = s.dropna()
                if len(valid_num) > 0:
                    c_stat.mean = round(float(valid_num.mean()), 2)
                    c_stat.std = round(float(valid_num.std()), 2) if len(valid_num) > 1 else 0.0
                    c_stat.min = round(float(valid_num.min()), 2)
                    c_stat.max = round(float(valid_num.max()), 2)
                    c_stat.median = round(float(valid_num.median()), 2)
                    c_stat.q25 = round(float(valid_num.quantile(0.25)), 2)
                    c_stat.q75 = round(float(valid_num.quantile(0.75)), 2)
                    
            column_stats_list.append(c_stat)
            
        # Correlations for numerical features
        num_cols = df.select_dtypes(include=[np.number]).columns
        corr_dict: Dict[str, Dict[str, float]] = {}
        if len(num_cols) > 1:
            corr_df = df[num_cols].corr().fillna(0.0)
            for c1 in num_cols:
                corr_dict[c1] = {}
                for c2 in num_cols:
                    corr_dict[c1][c2] = round(float(corr_df.loc[c1, c2]), 3)
                    
        # Compute Overall Health Score
        raw_score = 100 - (100 - completeness) * 0.4 - (100 - uniqueness) * 0.3 - health_penalty
        final_score = int(max(0, min(100, raw_score)))
        
        if final_score >= 85:
            recommendations.append("Dataset is clean and well-structured for immediate analytics & machine learning.")
        elif final_score >= 70:
            recommendations.append("Dataset is in good health with minor missing values or skewness.")
        else:
            recommendations.append("Data cleaning (imputation, type-casting) is strongly recommended.")
            
        health_score = DataHealthScore(
            score=final_score,
            completeness=completeness,
            uniqueness=uniqueness,
            issues_found=issues,
            recommendations=recommendations
        )
        
        preview = df.head(10).replace({np.nan: None}).to_dict(orient="records")
        
        return EDAResponse(
            dataset_name=ds_info["display_name"],
            total_rows=total_rows,
            total_columns=total_columns,
            memory_usage_kb=memory_kb,
            health_score=health_score,
            columns=column_stats_list,
            correlations=corr_dict,
            preview=preview
        )

eda_service = EDAService()
