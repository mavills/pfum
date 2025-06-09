import os
import uuid
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
import polars as pl
from fastapi import UploadFile, HTTPException, status

from app.core.config import settings
from app.core.logger import get_logger
from app.api.schemas.operator import Operator, Output, Config
from app.api.schemas.files import FileUploadResponse, GenerateNodeTemplateResponse

logger = get_logger("services.file")

# Default upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


class FileService:
    """Service for handling file operations and CSV processing."""
    
    def __init__(self):
        self.upload_dir = UPLOAD_DIR
        self._file_registry: Dict[str, Dict[str, Any]] = {}
    
    async def upload_csv_file(self, file: UploadFile) -> FileUploadResponse:
        """
        Upload and process a CSV file.
        
        Args:
            file: Uploaded file object
            
        Returns:
            FileUploadResponse with file info and extracted columns
        """
        if not file.filename or not file.filename.endswith('.csv'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only CSV files are supported"
            )
        
        # Generate unique file ID and path
        file_id = str(uuid.uuid4())
        file_path = self.upload_dir / f"{file_id}_{file.filename}"
        
        try:
            # Save file to disk
            content = await file.read()
            with open(file_path, "wb") as f:
                f.write(content)
            
            # Parse CSV to extract columns
            df = pl.read_csv(file_path)
            columns = df.columns
            
            # Store file info in registry
            file_info = {
                "file_id": file_id,
                "filename": file.filename,
                "file_path": str(file_path),
                "size": len(content),
                "columns": columns,
                "row_count": df.height
            }
            self._file_registry[file_id] = file_info
            
            logger.info(f"Uploaded CSV file: {file.filename} with {len(columns)} columns")
            
            return FileUploadResponse(
                file_id=file_id,
                filename=file.filename,
                file_path=str(file_path),
                size=len(content),
                columns=columns
            )
            
        except Exception as e:
            # Clean up file on error
            if file_path.exists():
                file_path.unlink()
            logger.error(f"Error uploading file: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error processing CSV file: {str(e)}"
            )
    
    def get_file_info(self, file_id: str) -> Dict[str, Any]:
        """Get file information by ID."""
        if file_id not in self._file_registry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File with ID {file_id} not found"
            )
        return self._file_registry[file_id]
    
    def generate_node_template(
        self, 
        file_id: str, 
        node_title: Optional[str] = None,
        node_description: Optional[str] = None
    ) -> GenerateNodeTemplateResponse:
        """
        Generate an Operator node template from a CSV file.
        
        Args:
            file_id: ID of the uploaded file
            node_title: Custom title for the node
            node_description: Custom description for the node
            
        Returns:
            GenerateNodeTemplateResponse with generated operator
        """
        file_info = self.get_file_info(file_id)
        columns = file_info["columns"]
        filename = file_info["filename"]
        
        # Generate outputs for each column
        outputs = []
        for i, column in enumerate(columns):
            output = Output(
                id=f"column_{i}",
                type="string",  # Default to string type
                name=column,
                description=f"Column: {column}",
                position=i
            )
            outputs.append(output)
        
        # Create operator template
        operator = Operator(
            title=node_title or f"CSV Input: {filename}",
            description=node_description or f"Input node for CSV file: {filename}",
            category="Input",
            id=f"csv_input_{file_id}",
            type="csv_input",
            inputs=[],  # Input nodes have no inputs
            outputs=outputs,
            config=Config()  # Empty config for now
        )
        
        return GenerateNodeTemplateResponse(
            operator=operator,
            file_info=file_info
        )
    
    def preview_csv(self, file_id: str, limit: int = 20) -> Tuple[List[str], List[List[str]], Optional[int]]:
        """
        Preview CSV file contents.
        
        Args:
            file_id: ID of the file to preview
            limit: Number of rows to preview
            
        Returns:
            Tuple of (headers, rows, total_row_count)
        """
        file_info = self.get_file_info(file_id)
        file_path = Path(file_info["file_path"])
        
        if not file_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found on disk"
            )
        
        try:
            # Read CSV with limit
            df = pl.read_csv(file_path, n_rows=limit)
            
            headers = df.columns
            rows = df.to_pandas().astype(str).values.tolist()
            total_rows = file_info.get("row_count")
            
            return headers, rows, total_rows
            
        except Exception as e:
            logger.error(f"Error previewing CSV: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error reading CSV file: {str(e)}"
            )


# Global instance
file_service = FileService() 