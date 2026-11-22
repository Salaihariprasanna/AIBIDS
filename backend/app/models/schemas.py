from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# --- Dataset Schemas ---
class DatasetInfo(BaseModel):
    id: str
    name: str
    display_name: str
    row_count: int
    column_count: int
    columns: List[str]
    dtypes: Dict[str, str]
    created_at: Optional[str] = None
    source_type: str = "upload" # upload, sample, url, database

class DatasetImportURLRequest(BaseModel):
    url: str
    name: Optional[str] = None
    format: Optional[str] = "auto" # auto, csv, json, parquet

class DatabaseConnectRequest(BaseModel):
    connection_url: str # sqlite:///, postgresql://, mysql://
    table_name: str
    custom_query: Optional[str] = None
    name: Optional[str] = None

# --- AutoEDA Schemas ---
class ColumnStats(BaseModel):
    name: str
    dtype: str
    non_null_count: int
    null_count: int
    null_percentage: float
    unique_count: int
    mean: Optional[float] = None
    std: Optional[float] = None
    min: Optional[Any] = None
    max: Optional[Any] = None
    median: Optional[float] = None
    q25: Optional[float] = None
    q75: Optional[float] = None
    top_values: Optional[List[Dict[str, Any]]] = None

class DataHealthScore(BaseModel):
    score: int # 0 to 100
    completeness: float
    uniqueness: float
    issues_found: List[str]
    recommendations: List[str]

class EDAResponse(BaseModel):
    dataset_name: str
    total_rows: int
    total_columns: int
    memory_usage_kb: float
    health_score: DataHealthScore
    columns: List[ColumnStats]
    correlations: Dict[str, Dict[str, float]]
    preview: List[Dict[str, Any]]

# --- Query & Text-to-SQL Schemas ---
class QueryRequest(BaseModel):
    dataset_id: str
    question: str
    temperature: Optional[float] = 0.2

class ChartRecommendation(BaseModel):
    chart_type: str # bar, line, pie, scatter, area, table
    x_axis: Optional[str] = None
    y_axis: Optional[str] = None
    series_name: Optional[str] = None
    title: str
    description: Optional[str] = None

class QueryResponse(BaseModel):
    question: str
    sql: str
    explanation: str
    data: List[Dict[str, Any]]
    row_count: int
    execution_time_ms: float
    chart: Optional[ChartRecommendation] = None
    insights: List[str] = []
    error: Optional[str] = None

# --- Predictive Analytics Schemas ---
class ForecastRequest(BaseModel):
    dataset_id: str
    date_column: str
    metric_column: str
    horizon_periods: int = 12
    frequency: str = "M" # D, W, M, Y

class ForecastResponse(BaseModel):
    historical: List[Dict[str, Any]]
    forecast: List[Dict[str, Any]]
    trend_summary: str
    growth_rate_pct: float
    confidence_interval: bool = True

class AnomalyRequest(BaseModel):
    dataset_id: str
    metric_columns: List[str]
    contamination: float = 0.05

class AnomalyResponse(BaseModel):
    total_anomalies: int
    anomalies: List[Dict[str, Any]]
    feature_importance: Dict[str, float]
    summary_findings: List[str]

# --- What-If Simulator Schemas ---
class ScenarioSimulationRequest(BaseModel):
    dataset_id: str
    target_metric: str # e.g. "profit" or "revenue"
    driver_adjustments: Dict[str, float] # e.g. {"marketing_spend": 0.20, "price": -0.05}

class SimulationResult(BaseModel):
    baseline_value: float
    simulated_value: float
    delta_value: float
    delta_percentage: float
    key_drivers: List[Dict[str, Any]]
    prescription_narrative: str
    sensitivity_curve: List[Dict[str, Any]]

# --- Executive Report Schemas ---
class ReportGenerateRequest(BaseModel):
    dataset_id: str
    focus_areas: Optional[List[str]] = None

class ExecutiveReportResponse(BaseModel):
    title: str
    executive_summary: str
    key_takeaways: List[str]
    identified_risks: List[str]
    strategic_recommendations: List[str]
    generated_at: str

# --- Settings & AI Status ---
class SettingsUpdateRequest(BaseModel):
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    llm_provider: Optional[str] = None

class LLMProviderStatus(BaseModel):
    active_provider: str
    gemini_configured: bool
    openai_configured: bool
    ollama_available: bool
    available_providers: List[str]
