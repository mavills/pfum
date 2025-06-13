from typing import List, Dict, Any, Optional
import os
import io
import pandas as pd
from fastapi import APIRouter, HTTPException, Query, status
from botocore.exceptions import ClientError
import boto3

from app.logger import get_logger
from app.config import settings

# Set up logger
logger = get_logger("api.s3")

# Create router
router = APIRouter()

# Initialize S3 client
s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
    region_name=os.getenv("AWS_REGION", "eu-west-1"),
)

S3_BUCKET = os.getenv("S3_BUCKET")

@router.get(
    "/list",
    response_model=List[Dict[str, Any]],
    summary="List files in S3 bucket",
    description="List files in S3 bucket with specified prefix",
)
async def list_files(prefix: str = Query("", description="Prefix to filter S3 objects")):
    """
    List files in S3 bucket with the given prefix.
    
    Args:
        prefix: Prefix to filter S3 objects
        
    Returns:
        List of dictionaries with file information
    """
    try:
        # List objects with the given prefix
        response = s3_client.list_objects_v2(Bucket=S3_BUCKET, Prefix=prefix)
        
        # Check if any files were found
        if "Contents" not in response:
            return []
            
        # Format the response
        files = [
            {
                "key": item["Key"],
                "size": item["Size"],
                "last_modified": item["LastModified"].isoformat(),
                "is_csv": item["Key"].lower().endswith(".csv")
            }
            for item in response["Contents"]
        ]
        
        return files
        
    except ClientError as e:
        logger.error("Error accessing S3", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error accessing S3: {str(e)}",
        )

@router.get(
    "/columns",
    response_model=List[str],
    summary="Get columns from CSV file",
    description="Get column names from a CSV file in S3",
)
async def get_file_columns(file_key: str = Query(..., description="S3 file key to analyze")):
    """
    Get columns from a CSV file in S3.
    
    Args:
        file_key: S3 file key
        
    Returns:
        List of column names
    """
    if not file_key.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are supported",
        )
        
    try:
        # Get the object from S3
        response = s3_client.get_object(Bucket=S3_BUCKET, Key=file_key)
        
        # Read only the header row to get column names
        df = pd.read_csv(
            io.BytesIO(response["Body"].read(1024)), # Read only first 1KB
            nrows=0,  # Read 0 rows - just the header
            encoding="utf-8",
        )
        
        return df.columns.tolist()
        
    except ClientError as e:
        logger.error("Error reading from S3", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File {file_key} not found in S3 or cannot be read",
        )
    except Exception as e:
        logger.error("Error processing CSV file", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error processing CSV file: {str(e)}",
        ) 