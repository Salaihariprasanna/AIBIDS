from fastapi import APIRouter, HTTPException
from app.services.report_service import report_service
from app.models.schemas import ReportGenerateRequest, ExecutiveReportResponse

router = APIRouter()

@router.post("/generate", response_model=ExecutiveReportResponse)
def generate_report(req: ReportGenerateRequest):
    try:
        return report_service.generate_executive_briefing(req.dataset_id, req.focus_areas)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
