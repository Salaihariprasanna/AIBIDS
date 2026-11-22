from fastapi import APIRouter, HTTPException
from app.services.simulator_service import simulator_service
from app.models.schemas import ScenarioSimulationRequest, SimulationResult

router = APIRouter()

@router.post("/simulate", response_model=SimulationResult)
def simulate_scenario(req: ScenarioSimulationRequest):
    try:
        return simulator_service.simulate_scenario(
            dataset_id=req.dataset_id,
            target_metric=req.target_metric,
            driver_adjustments=req.driver_adjustments
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
