from fastapi import APIRouter, HTTPException
from typing import List
from app.services.semantic_service import semantic_service, MetricDefinition

router = APIRouter()

@router.get("/{dataset_id}", response_model=List[MetricDefinition])
def get_dataset_metrics(dataset_id: str):
    return semantic_service.get_metrics_for_dataset(dataset_id)

@router.post("/", response_model=MetricDefinition)
def create_custom_metric(metric: MetricDefinition):
    try:
        return semantic_service.add_metric(metric)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{dataset_id}/{metric_name}")
def delete_metric(dataset_id: str, metric_name: str):
    success = semantic_service.delete_metric(dataset_id, metric_name)
    if not success:
        raise HTTPException(status_code=404, detail="Metric not found")
    return {"message": "Metric deleted successfully"}
