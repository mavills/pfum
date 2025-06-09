from fastapi import APIRouter, UploadFile, File, HTTPException, status
from typing import List

from app.api.schemas.files import (
    FileUploadResponse,
    GenerateNodeTemplateRequest,
    GenerateNodeTemplateResponse,
    CSVPreviewRequest,
    CSVPreviewResponse
)
from app.services.file_service import file_service
from app.core.logger import get_logger

logger = get_logger("api.files")
router = APIRouter()


@router.post(
    "/upload",
    response_model=FileUploadResponse,
    summary="Upload CSV file",
    description="Upload a CSV file and extract column information for node generation"
)
async def upload_csv_file(file: UploadFile = File(...)):
    """
    Upload a CSV file and return file information with extracted columns.
    """
    logger.info(f"Uploading file: {file.filename}")
    return await file_service.upload_csv_file(file)


@router.post(
    "/generate-node-template",
    response_model=GenerateNodeTemplateResponse,
    summary="Generate node template from uploaded file",
    description="Generate an Operator node template based on uploaded CSV file structure"
)
async def generate_node_template(request: GenerateNodeTemplateRequest):
    """
    Generate a node template (Operator) from an uploaded CSV file.
    This creates outputs for each column in the CSV.
    """
    logger.info(f"Generating node template for file: {request.file_id}")
    return file_service.generate_node_template(
        request.file_id,
        request.node_title,
        request.node_description
    )


@router.post(
    "/preview",
    response_model=CSVPreviewResponse,
    summary="Preview CSV file contents",
    description="Get a preview of CSV file contents with specified row limit"
)
async def preview_csv_file(request: CSVPreviewRequest):
    """
    Preview the contents of an uploaded CSV file.
    """
    logger.info(f"Previewing file: {request.file_id} with limit: {request.limit}")
    
    headers, rows, total_rows = file_service.preview_csv(request.file_id, request.limit)
    
    return CSVPreviewResponse(
        headers=headers,
        rows=rows,
        total_rows=total_rows,
        preview_limit=request.limit
    )


@router.get(
    "/{file_id}/info",
    summary="Get file information",
    description="Get information about an uploaded file"
)
async def get_file_info(file_id: str):
    """
    Get information about an uploaded file.
    """
    logger.info(f"Getting file info for: {file_id}")
  