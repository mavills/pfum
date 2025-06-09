from typing import List, Optional
from pydantic import BaseModel, Field

from .operator import Operator


class FileUploadResponse(BaseModel):
    """Response model for file upload."""
    file_id: str = Field(description="Unique identifier for the uploaded file")
    filename: str = Field(description="Original filename")
    file_path: str = Field(description="Path where file is stored")
    size: int = Field(description="File size in bytes")
    columns: List[str] = Field(description="List of column headers extracted from CSV")


class GenerateNodeTemplateRequest(BaseModel):
    """Request model for generating node template from uploaded file."""
    file_id: str = Field(description="ID of the uploaded file")
    node_title: Optional[str] = Field(None, description="Custom title for the node")
    node_description: Optional[str] = Field(None, description="Custom description for the node")


class GenerateNodeTemplateResponse(BaseModel):
    """Response model for generated node template."""
    operator: Operator = Field(description="Generated operator template")
    file_info: dict = Field(description="Information about the source file")


class CSVPreviewRequest(BaseModel):
    """Request model for CSV preview."""
    file_id: str = Field(description="ID of the file to preview")
    limit: int = Field(default=20, ge=1, le=100, description="Number of rows to preview")


class CSVPreviewResponse(BaseModel):
    """Response model for CSV preview."""
    headers: List[str] = Field(description="Column headers")
    rows: List[List[str]] = Field(description="Preview rows as list of lists")
    total_rows: Optional[int] = Field(None, description="Total number of rows in file if known")
    preview_limit: int = Field(description="Number of rows in this preview") 