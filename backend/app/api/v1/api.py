from fastapi import APIRouter
from app.api.v1.endpoints import datasets, analytics, query, predictive, simulator, reports, settings, semantic

api_router = APIRouter()

api_router.include_router(datasets.router, prefix="/datasets", tags=["Datasets & Ingestion"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["AutoEDA & Analytics"])
api_router.include_router(query.router, prefix="/query", tags=["Text-to-SQL & Chat BI"])
api_router.include_router(predictive.router, prefix="/predictive", tags=["Predictive Analytics"])
api_router.include_router(simulator.router, prefix="/simulator", tags=["What-If Simulator"])
api_router.include_router(reports.router, prefix="/reports", tags=["Executive Reports"])
api_router.include_router(settings.router, prefix="/settings", tags=["AI Engine Settings"])
api_router.include_router(semantic.router, prefix="/semantic", tags=["Semantic Metrics Layer"])
