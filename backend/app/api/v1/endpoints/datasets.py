from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict, Any
from app.services.data_service import data_service
from app.models.schemas import DatasetInfo, DatasetImportURLRequest, DatabaseConnectRequest

router = APIRouter()

@router.get("/", response_model=List[DatasetInfo])
def list_datasets():
    return data_service.list_datasets()

@router.post("/upload", response_model=DatasetInfo)
async def upload_file(file: UploadFile = File(...)):
    try:
        content = await file.read()
        info = data_service.ingest_file(content, file.filename)
        return info
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/import-url", response_model=DatasetInfo)
async def import_from_url(req: DatasetImportURLRequest):
    try:
        info = await data_service.import_from_url(req.url, req.name, req.format)
        return info
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/connect-db", response_model=DatasetInfo)
def connect_database(req: DatabaseConnectRequest):
    try:
        info = data_service.import_from_database(
            connection_url=req.connection_url,
            table_name=req.table_name,
            custom_query=req.custom_query,
            name=req.name
        )
        return info
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{dataset_id}/preview")
def get_preview(dataset_id: str, limit: int = 50):
    try:
        return data_service.get_preview(dataset_id, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
