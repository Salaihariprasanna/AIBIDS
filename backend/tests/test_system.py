import pytest
import os
from app.services.data_service import data_service
from app.services.eda_service import eda_service
from app.services.sql_engine import sql_engine
from app.services.ai_service import ai_service
from app.services.ml_service import ml_service
from app.services.simulator_service import simulator_service
from app.services.report_service import report_service
from app.core.security import SQLSecurityGuard

def test_data_service_sample_loading():
    datasets = data_service.list_datasets()
    assert len(datasets) >= 3
    sample_ids = [d["id"] for d in datasets]
    assert "sample_ecommerce_sales" in sample_ids
    assert "sample_saas_subscription_metrics" in sample_ids

def test_auto_eda_generation():
    eda = eda_service.generate_eda("sample_ecommerce_sales")
    assert eda.total_rows >= 1000
    assert eda.health_score.score > 0
    assert eda.health_score.completeness > 90
    assert len(eda.columns) > 0

def test_sql_security_guardrails():
    # Valid SELECT
    is_safe, _ = SQLSecurityGuard.validate_sql("SELECT * FROM sample_ecommerce_sales LIMIT 5")
    assert is_safe is True

    # Block destructive queries
    is_safe, msg = SQLSecurityGuard.validate_sql("DROP TABLE sample_ecommerce_sales")
    assert is_safe is False
    assert "SELECT" in msg or "forbidden" in msg

    is_safe, msg = SQLSecurityGuard.validate_sql("DELETE FROM sample_ecommerce_sales WHERE id = 1")
    assert is_safe is False

def test_sql_execution_and_chart_recommendation():
    sql = "SELECT category, SUM(sales) AS total_sales FROM sample_ecommerce_sales GROUP BY category ORDER BY total_sales DESC"
    result = sql_engine.execute_and_analyze(sql, "sample_ecommerce_sales")
    assert result["row_count"] > 0
    assert result["chart"] is not None
    assert result["chart"].chart_type in ["bar", "pie"]
    assert len(result["insights"]) > 0

def test_ai_text_to_sql_semantic_fallback():
    sql, explanation = ai_service.generate_sql("sample_ecommerce_sales", "Show top 5 categories by total sales")
    assert "SELECT" in sql
    assert "sample_ecommerce_sales" in sql
    assert len(explanation) > 0

def test_predictive_forecasting():
    res = ml_service.generate_forecast(
        dataset_id="sample_saas_subscription_metrics",
        date_column="month",
        metric_column="mrr",
        horizon_periods=6,
        frequency="M"
    )
    assert len(res.historical) > 0
    assert len(res.forecast) == 6
    assert res.forecast[0]["forecast"] > 0
    assert res.growth_rate_pct != 0

def test_what_if_simulation():
    res = simulator_service.simulate_scenario(
        dataset_id="sample_ecommerce_sales",
        target_metric="profit",
        driver_adjustments={"sales": 0.15, "shipping_cost": -0.10}
    )
    assert res.baseline_value > 0
    assert res.simulated_value > 0
    assert len(res.key_drivers) > 0
    assert len(res.prescription_narrative) > 0

def test_executive_report_generation():
    rep = report_service.generate_executive_briefing("sample_ecommerce_sales")
    assert "Executive" in rep.title or "Strategic" in rep.title
    assert len(rep.executive_summary) > 20
    assert len(rep.key_takeaways) > 0
    assert len(rep.strategic_recommendations) > 0
