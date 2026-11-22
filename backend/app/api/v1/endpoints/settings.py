from fastapi import APIRouter
from app.services.ai_service import ai_service
from app.models.schemas import SettingsUpdateRequest, LLMProviderStatus

router = APIRouter()

@router.get("/status", response_model=LLMProviderStatus)
def get_ai_status():
    return ai_service.get_provider_status()

@router.post("/update")
def update_ai_settings(req: SettingsUpdateRequest):
    ai_service.update_keys(
        gemini_key=req.gemini_api_key,
        openai_key=req.openai_api_key,
        provider=req.llm_provider
    )
    return {"message": "AI settings updated successfully", "status": ai_service.get_provider_status()}
