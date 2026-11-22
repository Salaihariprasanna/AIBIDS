import duckdb
from typing import Dict, Any, Optional
import pandas as pd
import threading

class DatabaseManager:
    """
    Manages DuckDB in-memory database instance for OLAP queries
    and maintains registered tables/datasets.
    """
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(DatabaseManager, cls).__new__(cls)
                cls._instance._init_db()
            return cls._instance
            
    def _init_db(self):
        self.conn = duckdb.connect(database=':memory:', read_only=False)
        self.registered_tables: Dict[str, Dict[str, Any]] = {}
        
    def register_dataframe(self, table_name: str, df: pd.DataFrame, metadata: Optional[Dict[str, Any]] = None):
        """Registers a pandas DataFrame as a DuckDB table."""
        # Sanitize table name
        safe_name = "".join(c if c.isalnum() else "_" for c in table_name).lower()
        if safe_name[0].isdigit():
            safe_name = f"t_{safe_name}"
            
        self.conn.register(f"{safe_name}_df", df)
        self.conn.execute(f"CREATE OR REPLACE TABLE {safe_name} AS SELECT * FROM {safe_name}_df")
        
        self.registered_tables[safe_name] = {
            "name": safe_name,
            "display_name": table_name,
            "row_count": len(df),
            "columns": list(df.columns),
            "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
            "metadata": metadata or {}
        }
        return safe_name
        
    def execute_query(self, sql: str) -> pd.DataFrame:
        """Executes a SQL query against DuckDB and returns a pandas DataFrame."""
        return self.conn.execute(sql).fetchdf()
        
    def get_table_schema(self, table_name: str) -> Dict[str, Any]:
        """Returns schema metadata for a registered table."""
        if table_name not in self.registered_tables:
            raise ValueError(f"Table '{table_name}' not found.")
        return self.registered_tables[table_name]
        
    def list_tables(self) -> Dict[str, Dict[str, Any]]:
        """Returns all registered tables and their summary."""
        return self.registered_tables

db_manager = DatabaseManager()
