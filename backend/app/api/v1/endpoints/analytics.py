from fastapi import APIRouter, HTTPException
from app.services.eda_service import eda_service
from app.models.schemas import EDAResponse

router = APIRouter()

@router.get("/eda/{dataset_id}", response_model=EDAResponse)
def get_eda_report(dataset_id: str):
    try:
        return eda_service.generate_eda(dataset_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
