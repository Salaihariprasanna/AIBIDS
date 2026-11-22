from typing import Dict, List, Any, Optional
from pydantic import BaseModel

class MetricDefinition(BaseModel):
    name: str
    display_name: str
    dataset_id: str
    formula_sql: str
    description: str

class SemanticLayerService:
    """
    Manages custom business metric definitions & formulas (Semantic Layer).
    Empowers Text-to-SQL LLM to accurately calculate calculated KPIs.
    """
    def __init__(self):
        self.metrics: Dict[str, List[MetricDefinition]] = {
            "sample_ecommerce_sales": [
                MetricDefinition(
                    name="profit_margin",
                    display_name="Profit Margin (%)",
                    dataset_id="sample_ecommerce_sales",
                    formula_sql="ROUND((SUM(profit) / NULLIF(SUM(sales), 0)) * 100, 2)",
                    description="Percentage of revenue retained as profit after costs."
                ),
                MetricDefinition(
                    name="avg_order_value",
                    display_name="Average Order Value ($)",
                    dataset_id="sample_ecommerce_sales",
                    formula_sql="ROUND(AVG(sales), 2)",
                    description="Average monetary gross transaction size per order."
                )
            ],
            "sample_saas_subscription_metrics": [
                MetricDefinition(
                    name="magic_number",
                    display_name="SaaS Magic Number",
                    dataset_id="sample_saas_subscription_metrics",
                    formula_sql="ROUND((mrr * 12) / NULLIF(marketing_spend, 0), 2)",
                    description="Sales efficiency metric measuring ARR generated per dollar spent on marketing."
                ),
                MetricDefinition(
                    name="ltv_to_cac",
                    display_name="LTV to CAC Ratio",
                    dataset_id="sample_saas_subscription_metrics",
                    formula_sql="ROUND(ltv / NULLIF(cac, 0), 2)",
                    description="Customer lifetime value relative to customer acquisition cost."
                )
            ]
        }

    def get_metrics_for_dataset(self, dataset_id: str) -> List[MetricDefinition]:
        return self.metrics.get(dataset_id, [])

    def add_metric(self, metric: MetricDefinition) -> MetricDefinition:
        if metric.dataset_id not in self.metrics:
            self.metrics[metric.dataset_id] = []
        # Replace if existing with same name
        self.metrics[metric.dataset_id] = [m for m in self.metrics[metric.dataset_id] if m.name != metric.name]
        self.metrics[metric.dataset_id].append(metric)
        return metric

    def delete_metric(self, dataset_id: str, metric_name: str) -> bool:
        if dataset_id in self.metrics:
            self.metrics[dataset_id] = [m for m in self.metrics[dataset_id] if m.name != metric_name]
            return True
        return False

semantic_service = SemanticLayerService()
