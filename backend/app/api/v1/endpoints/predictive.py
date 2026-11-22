from fastapi import APIRouter, HTTPException
from app.services.ml_service import ml_service
from app.models.schemas import ForecastRequest, ForecastResponse, AnomalyRequest, AnomalyResponse

router = APIRouter()

@router.post("/forecast", response_model=ForecastResponse)
def get_forecast(req: ForecastRequest):
    try:
        return ml_service.generate_forecast(
            dataset_id=req.dataset_id,
            date_column=req.date_column,
            metric_column=req.metric_column,
            horizon_periods=req.horizon_periods,
            frequency=req.frequency
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/anomalies", response_model=AnomalyResponse)
def get_anomalies(req: AnomalyRequest):
    try:
        return ml_service.detect_anomalies(
            dataset_id=req.dataset_id,
            metric_columns=req.metric_columns,
            contamination=req.contamination
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
