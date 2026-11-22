import re
import json
from typing import Dict, Any, Tuple, Optional
from app.core.config import settings
from app.services.data_service import data_service
from app.services.semantic_service import semantic_service

class AIService:
    """
    Intelligent AI Agent for Text-to-SQL generation and Natural Language
    Insight Synthesis. Supports Gemini, OpenAI, and a Smart Semantic Engine fallback.
    """
    
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY
        
    def get_provider_status(self) -> Dict[str, Any]:
        has_gemini = bool(self.gemini_key and len(self.gemini_key) > 5)
        has_openai = bool(self.openai_key and len(self.openai_key) > 5)
        
        active = "semantic-fallback"
        if settings.LLM_PROVIDER == "gemini" and has_gemini:
            active = "gemini"
        elif settings.LLM_PROVIDER == "openai" and has_openai:
            active = "openai"
        elif has_gemini:
            active = "gemini"
        elif has_openai:
            active = "openai"
            
        return {
            "active_provider": active,
            "gemini_configured": has_gemini,
            "openai_configured": has_openai,
            "ollama_available": False,
            "available_providers": ["gemini", "openai", "semantic-fallback"]
        }

    def update_keys(self, gemini_key: Optional[str] = None, openai_key: Optional[str] = None, provider: Optional[str] = None):
        if gemini_key is not None:
            self.gemini_key = gemini_key
        if openai_key is not None:
            self.openai_key = openai_key
        if provider:
            settings.LLM_PROVIDER = provider

    def generate_sql(self, dataset_id: str, question: str) -> Tuple[str, str]:
        """
        Translates a natural language question into safe DuckDB SQL.
        Returns: (sql_query, explanation_of_logic)
        """
        ds = data_service.get_dataset(dataset_id)
        table_name = ds["name"]
        cols = ds["columns"]
        dtypes = ds["dtypes"]
        df_sample = ds["df"].head(3).to_dict(orient="records")
        custom_metrics = semantic_service.get_metrics_for_dataset(dataset_id)
        metrics_dict = {m.name: m.formula_sql for m in custom_metrics}
        
        provider_status = self.get_provider_status()
        active = provider_status["active_provider"]
        
        if active == "gemini":
            try:
                return self._call_gemini_sql(table_name, cols, dtypes, df_sample, question)
            except Exception as e:
                print(f"Gemini SQL error ({e}), switching to smart semantic engine.")
                
        elif active == "openai":
            try:
                return self._call_openai_sql(table_name, cols, dtypes, df_sample, question)
            except Exception as e:
                print(f"OpenAI SQL error ({e}), switching to smart semantic engine.")
                
        # Smart Semantic Engine Fallback
        return self._semantic_fallback_sql(table_name, cols, dtypes, ds["df"], question)

    def _call_gemini_sql(self, table_name: str, cols: list, dtypes: dict, df_sample: list, question: str) -> Tuple[str, str]:
        from google import genai
        from google.genai import types
        
        client = genai.Client(api_key=self.gemini_key)
        
        prompt = f"""
You are an expert DuckDB SQL and Business Intelligence Agent.
Generate ONLY a clean, valid, read-only DuckDB SQL query to answer the user's question.

Database Schema:
Table Name: {table_name}
Columns and Types: {json.dumps(dtypes)}
Sample Data: {json.dumps(df_sample)}

User Question: "{question}"

Instructions:
1. Return a JSON object with two keys:
   "sql": "<the exact DuckDB SQL query using table '{table_name}'>"
   "explanation": "<a brief 1-2 sentence explanation of the logic>"
2. The query MUST be a SELECT query only.
3. Handle aggregation, GROUP BY, ORDER BY, and LIMIT appropriately.
4. Output valid JSON only, without markdown fences.
"""
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        text = response.text.strip()
        # Parse JSON
        if "```" in text:
            text = re.search(r"\{.*\}", text, re.DOTALL).group(0)
        data = json.loads(text)
        return data["sql"], data.get("explanation", "Generated via Gemini 2.5 Flash")

    def _call_openai_sql(self, table_name: str, cols: list, dtypes: dict, df_sample: list, question: str) -> Tuple[str, str]:
        from openai import OpenAI
        client = OpenAI(api_key=self.openai_key)
        
        prompt = f"""
You are an expert DuckDB SQL and Business Intelligence Agent.
Generate a clean, valid DuckDB SQL query to answer the user's question.

Table Name: {table_name}
Columns: {json.dumps(dtypes)}
Sample Data: {json.dumps(df_sample)}

User Question: "{question}"

Return JSON: {{"sql": "...", "explanation": "..."}}
"""
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        data = json.loads(resp.choices[0].message.content)
        return data["sql"], data.get("explanation", "Generated via OpenAI GPT-4o-mini")

    def _semantic_fallback_sql(self, table_name: str, cols: list, dtypes: dict, df, question: str) -> Tuple[str, str]:
        """
        High-precision rule-based semantic parser for standard analytical queries
        (Top N, Sum, Average, Trends, Group By, Filters) when offline/no API key.
        """
        q = question.lower().strip()
        num_cols = [c for c in cols if "int" in dtypes.get(c, "") or "float" in dtypes.get(c, "")]
        date_cols = [c for c in cols if any(k in c.lower() for k in ['date', 'month', 'year', 'period'])]
        cat_cols = [c for c in cols if c not in num_cols and c not in date_cols]
        
        # 1. Total/Sum requests
        if any(w in q for w in ["total", "sum", "overall", "aggregate"]):
            target_col = next((c for c in num_cols if c in q), num_cols[0] if num_cols else cols[0])
            # Check if grouped by category
            target_cat = next((c for c in cat_cols if c in q), None)
            if target_cat:
                sql = f"SELECT {target_cat}, SUM({target_col}) AS total_{target_col} FROM {table_name} GROUP BY {target_cat} ORDER BY total_{target_col} DESC LIMIT 10"
                return sql, f"Aggregated total {target_col} grouped by {target_cat}."
            else:
                sql = f"SELECT SUM({target_col}) AS total_{target_col} FROM {table_name}"
                return sql, f"Calculated total sum for metric '{target_col}'."
                
        # 2. Average / Mean requests
        if any(w in q for w in ["average", "avg", "mean"]):
            target_col = next((c for c in num_cols if c in q), num_cols[0] if num_cols else cols[0])
            target_cat = next((c for c in cat_cols if c in q), None)
            if target_cat:
                sql = f"SELECT {target_cat}, ROUND(AVG({target_col}), 2) AS avg_{target_col} FROM {table_name} GROUP BY {target_cat} ORDER BY avg_{target_col} DESC LIMIT 10"
                return sql, f"Calculated average {target_col} across {target_cat}."
            else:
                sql = f"SELECT ROUND(AVG({target_col}), 2) AS avg_{target_col} FROM {table_name}"
                return sql, f"Calculated average for '{target_col}'."
                
        # 3. Top / Highest / Best performers
        if any(w in q for w in ["top", "highest", "best", "most", "rank"]):
            # Extract number if present (e.g. top 5)
            n_match = re.search(r"\b(\d+)\b", q)
            n = int(n_match.group(1)) if n_match else 5
            target_val = next((c for c in num_cols if c in q), num_cols[0] if num_cols else cols[0])
            target_cat = next((c for c in cat_cols if c in q), cat_cols[0] if cat_cols else cols[0])
            sql = f"SELECT {target_cat}, SUM({target_val}) AS total_{target_val} FROM {table_name} GROUP BY {target_cat} ORDER BY total_{target_val} DESC LIMIT {n}"
            return sql, f"Identified top {n} {target_cat} ranked by total {target_val}."
            
        # 4. Bottom / Lowest performers
        if any(w in q for w in ["bottom", "lowest", "least", "worst"]):
            n_match = re.search(r"\b(\d+)\b", q)
            n = int(n_match.group(1)) if n_match else 5
            target_val = next((c for c in num_cols if c in q), num_cols[0] if num_cols else cols[0])
            target_cat = next((c for c in cat_cols if c in q), cat_cols[0] if cat_cols else cols[0])
            sql = f"SELECT {target_cat}, SUM({target_val}) AS total_{target_val} FROM {table_name} GROUP BY {target_cat} ORDER BY total_{target_val} ASC LIMIT {n}"
            return sql, f"Identified bottom {n} {target_cat} ranked by total {target_val}."
            
        # 5. Trend / Over Time requests
        if any(w in q for w in ["trend", "over time", "monthly", "by date", "growth", "timeline"]):
            d_col = date_cols[0] if date_cols else cols[0]
            target_val = next((c for c in num_cols if c in q), num_cols[0] if num_cols else cols[0])
            sql = f"SELECT {d_col}, SUM({target_val}) AS {target_val} FROM {table_name} GROUP BY {d_col} ORDER BY {d_col} ASC"
            return sql, f"Analyzed trend of {target_val} over time indexed by {d_col}."
            
        # Default: Select top 15 records
        selected_cols = ", ".join(cols[:6])
        sql = f"SELECT {selected_cols} FROM {table_name} LIMIT 15"
        return sql, f"Retrieved overview of records from table '{table_name}'."

ai_service = AIService()
