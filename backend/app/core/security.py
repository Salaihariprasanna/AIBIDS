import re

class SQLSecurityGuard:
    """
    Validates that user/LLM-generated SQL queries are safe, read-only SELECT queries.
    Blocks destructive DDL/DML statements and malicious operations.
    """
    
    FORBIDDEN_KEYWORDS = [
        r"\bDROP\b",
        r"\bDELETE\b",
        r"\bTRUNCATE\b",
        r"\bUPDATE\b",
        r"\bINSERT\b",
        r"\bALTER\b",
        r"\bCREATE\b",
        r"\bATTACH\b",
        r"\bDETACH\b",
        r"\bCOPY\b",
        r"\bEXPORT\b",
        r"\bIMPORT\b",
        r"\bPRAGMA\b",
        r"\bEXECUTE\b",
        r"\bEXEC\b",
        r"\bCALL\b",
        r"\bGRANT\b",
        r"\bREVOKE\b"
    ]
    
    @classmethod
    def validate_sql(cls, sql: str) -> tuple[bool, str]:
        """
        Validates SQL safety. Returns (is_safe, error_or_cleaned_sql).
        """
        if not sql or not sql.strip():
            return False, "Query cannot be empty."
            
        cleaned = sql.strip().rstrip(";")
        
        # Check for non-SELECT statements
        if not re.match(r"^(WITH\s+.*?\s+SELECT|SELECT)\s+", cleaned, re.IGNORECASE | re.DOTALL):
            return False, "Only read-only SELECT queries are permitted."
            
        for pattern in cls.FORBIDDEN_KEYWORDS:
            if re.search(pattern, cleaned, re.IGNORECASE):
                return False, f"Query contains forbidden keyword matching pattern '{pattern}'."
                
        # Block multi-statement queries
        if ";" in cleaned:
            return False, "Multiple SQL statements in a single execution are prohibited."
            
        return True, cleaned
