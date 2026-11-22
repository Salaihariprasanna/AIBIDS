from fastapi import APIRouter, HTTPException
from app.services.ai_service import ai_service
from app.services.sql_engine import sql_engine
from app.services.data_service import data_service
from app.models.schemas import QueryRequest, QueryResponse

router = APIRouter()

@router.post("/execute", response_model=QueryResponse)
def execute_natural_language_query(req: QueryRequest):
    try:
        # 1. Generate SQL from question via AI Service
        sql, explanation = ai_service.generate_sql(req.dataset_id, req.question)
        
        # 2. Retrieve table name
        ds = data_service.get_dataset(req.dataset_id)
        table_name = ds["name"]
        
        # 3. Execute & analyze via SQL Engine
        result = sql_engine.execute_and_analyze(sql, table_name)
        
        return QueryResponse(
            question=req.question,
            sql=sql,
            explanation=explanation,
            data=result["data"],
            row_count=result["row_count"],
            execution_time_ms=result["execution_time_ms"],
            chart=result["chart"],
            insights=result["insights"]
        )
    except Exception as e:
        return QueryResponse(
            question=req.question,
            sql="-- Failed to execute query",
            explanation=str(e),
            data=[],
            row_count=0,
            execution_time_ms=0.0,
            error=str(e)
        )
