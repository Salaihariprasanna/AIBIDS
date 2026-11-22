import os
import uuid
import httpx
import pandas as pd
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Optional
from sqlalchemy import create_engine
from app.core.config import settings
from app.core.database import db_manager

class DataService:
    """
    Handles universal dataset ingestion (Files, URLs, SQL DBs, Samples),
    caching, and DuckDB registration.
    """
    
    def __init__(self):
        self.datasets: Dict[str, Dict[str, Any]] = {}
        self._load_sample_datasets()
        
    def _load_sample_datasets(self):
        """Pre-loads packaged sample datasets into the system."""
        if not settings.SAMPLE_DATA_DIR.exists():
            return
            
        for file_path in settings.SAMPLE_DATA_DIR.glob("*.csv"):
            try:
                ds_id = f"sample_{file_path.stem}"
                df = pd.read_csv(file_path)
                display_name = file_path.stem.replace("_", " ").title()
                
                table_name = db_manager.register_dataframe(
                    table_name=ds_id,
                    df=df,
                    metadata={"source": "sample", "path": str(file_path)}
                )
                
                self.datasets[ds_id] = {
                    "id": ds_id,
                    "name": table_name,
                    "display_name": display_name,
                    "row_count": len(df),
                    "column_count": len(df.columns),
                    "columns": list(df.columns),
                    "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
                    "source_type": "sample",
                    "df": df
                }
            except Exception as e:
                print(f"Error loading sample dataset {file_path}: {e}")
                
    def list_datasets(self) -> List[Dict[str, Any]]:
        """Returns metadata for all available datasets."""
        res = []
        for ds_id, ds in self.datasets.items():
            res.append({
                "id": ds["id"],
                "name": ds["name"],
                "display_name": ds["display_name"],
                "row_count": ds["row_count"],
                "column_count": ds["column_count"],
                "columns": ds["columns"],
                "dtypes": ds["dtypes"],
                "source_type": ds.get("source_type", "upload")
            })
        return res
        
    def get_dataset(self, dataset_id: str) -> Dict[str, Any]:
        """Gets dataset metadata and dataframe."""
        if dataset_id not in self.datasets:
            raise ValueError(f"Dataset '{dataset_id}' not found.")
        return self.datasets[dataset_id]
        
    def get_dataframe(self, dataset_id: str) -> pd.DataFrame:
        """Retrieves the pandas DataFrame for a given dataset."""
        return self.get_dataset(dataset_id)["df"]
        
    def ingest_file(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """Ingests user-uploaded files (CSV, XLSX, JSON, Parquet)."""
        ext = Path(filename).suffix.lower()
        ds_id = f"ds_{uuid.uuid4().hex[:8]}"
        display_name = Path(filename).stem.replace("_", " ").title()
        
        save_path = settings.UPLOADS_DIR / f"{ds_id}_{filename}"
        with open(save_path, "wb") as f:
            f.write(file_content)
            
        if ext == ".csv":
            df = pd.read_csv(save_path)
        elif ext in [".xlsx", ".xls"]:
            df = pd.read_excel(save_path)
        elif ext == ".json":
            df = pd.read_json(save_path)
        elif ext == ".parquet":
            df = pd.read_parquet(save_path)
        else:
            raise ValueError(f"Unsupported file format '{ext}'. Please upload CSV, Excel, JSON, or Parquet.")
            
        # Clean column names
        df.columns = [str(c).strip().replace(" ", "_").lower() for c in df.columns]
        
        table_name = db_manager.register_dataframe(
            table_name=ds_id,
            df=df,
            metadata={"source": "upload", "filename": filename}
        )
        
        info = {
            "id": ds_id,
            "name": table_name,
            "display_name": display_name,
            "row_count": len(df),
            "column_count": len(df.columns),
            "columns": list(df.columns),
            "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
            "source_type": "upload",
            "df": df
        }
        self.datasets[ds_id] = info
        return info
        
    async def import_from_url(self, url: str, name: Optional[str] = None, fmt: str = "auto") -> Dict[str, Any]:
        """Imports dataset from a remote URL."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            content = resp.content
            
        filename = url.split("?")[0].split("/")[-1] or "imported_data.csv"
        if name:
            filename = f"{name}.csv" if not Path(filename).suffix else f"{name}{Path(filename).suffix}"
            
        return self.ingest_file(content, filename)
        
    def import_from_database(self, connection_url: str, table_name: str, custom_query: Optional[str] = None, name: Optional[str] = None) -> Dict[str, Any]:
        """Imports data from an external SQL database (PostgreSQL, MySQL, SQLite)."""
        engine = create_engine(connection_url)
        query = custom_query if custom_query else f"SELECT * FROM {table_name}"
        
        df = pd.read_sql(query, engine)
        ds_id = f"db_{uuid.uuid4().hex[:8]}"
        display_name = name or table_name.title()
        
        df.columns = [str(c).strip().replace(" ", "_").lower() for c in df.columns]
        
        tbl = db_manager.register_dataframe(
            table_name=ds_id,
            df=df,
            metadata={"source": "database", "connection_url": connection_url}
        )
        
        info = {
            "id": ds_id,
            "name": tbl,
            "display_name": display_name,
            "row_count": len(df),
            "column_count": len(df.columns),
            "columns": list(df.columns),
            "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
            "source_type": "database",
            "df": df
        }
        self.datasets[ds_id] = info
        return info
        
    def get_preview(self, dataset_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Returns sample rows of the dataset as JSON."""
        df = self.get_dataframe(dataset_id)
        # Handle NaN and timestamp formatting for clean JSON serialization
        clean_df = df.head(limit).replace({np.nan: None})
        return clean_df.to_dict(orient="records")

data_service = DataService()
