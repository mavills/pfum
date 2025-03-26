from typing import Optional
from datetime import datetime, UTC
import os
import io
import base64

import boto3
import pandas as pd
from botocore.exceptions import ClientError
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from app.api.schemas.transform import (
    Node,
    NodeType,
    TransformDataResponse,
    TransformRequest,
)
from app.core.logger import get_logger
from app.core.config import settings
from app.core.dag import map_node_id_to_node, select_subtree, topological_sort

# Load environment variables
load_dotenv()

# Set up logger
logger = get_logger("api.transform")

# Create router
router = APIRouter()

# Mock database for demo purposes
# In a real application, use a proper database
MOCK_DB = {
    "configs": {},
}

# Initialize S3 client
s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
    region_name=os.getenv("AWS_REGION", "us-east-1"),
)

S3_BUCKET = os.getenv("S3_BUCKET")


def read_csv_from_s3(file_path: str, limit: Optional[int] = None) -> pd.DataFrame:
    """
    Read CSV data from S3 bucket into a pandas DataFrame.

    Args:
        file_path: Path to the file in S3
        limit: Maximum number of rows to read

    Returns:
        Pandas DataFrame containing the CSV data

    Raises:
        HTTPException: If the file cannot be read or doesn't exist
    """
    try:
        # Get the object from S3
        response = s3_client.get_object(Bucket=S3_BUCKET, Key=file_path)

        # Try reading with default settings first
        df = pd.read_csv(
            io.BytesIO(response["Body"].read()),
            nrows=limit if limit else None,
            encoding="utf-8",
            on_bad_lines="warn",
            low_memory=False,
            dtype=str,
        )
        return df

    except ClientError as e:
        logger.error("Error reading from S3", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File {file_path} not found in S3 or cannot be read",
        )
    except Exception as e:
        logger.error("Error processing CSV file", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error processing CSV file: {str(e)}",
        )


def get_latest_file_from_s3(prefix: str) -> str:
    """
    Get the latest file from S3 that starts with the given prefix.

    Note: This implementation only looks at the first page of results from list_objects_v2.
    Since S3 list operations are paginated and ordered lexicographically, we would need to
    use the continuation token to scan all pages to definitively find the most recent file.

    Args:
        prefix: Prefix to filter S3 objects by

    Returns:
        Key of the latest file in S3

    Raises:
        HTTPException: If no files are found or S3 access fails
    """
    try:
        # List objects with the given prefix
        response = s3_client.list_objects_v2(Bucket=S3_BUCKET, Prefix=prefix)

        # Check if any files were found
        if "Contents" not in response or not response["Contents"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No files found with prefix {prefix}",
            )

        # Sort by last modified date and get the most recent
        latest_file = max(response["Contents"], key=lambda x: x["LastModified"])
        return latest_file["Key"]

    except ClientError as e:
        logger.error("Error accessing S3", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error accessing S3: {str(e)}",
        )


def convert_to_csv(df: pd.DataFrame) -> str:
    """
    Convert data to CSV format using pandas.

    Args:
        data: List of dictionaries to convert

    Returns:
        Base64 encoded CSV string
    """
    if not df:
        return base64.b64encode("".encode()).decode()

    try:

        # Convert to CSV string
        csv_buffer = io.StringIO()
        df.to_csv(
            csv_buffer,
            index=False,
            quoting=1,  # Quote all non-numeric fields
            encoding="utf-8",
        )

        # Get the CSV string and encode it
        csv_string = csv_buffer.getvalue()
        return csv_string

    except Exception as e:
        logger.error("Error converting data to CSV", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error converting data to CSV: {str(e)}",
        )


@router.post(
    "/transform",
    response_model=TransformDataResponse,
    summary="Transform data using a configuration",
    description="Apply a saved transformation configuration to input data from S3",
)
async def transform_data(request: TransformRequest):
    # Get the configuration either from request or mock DB
    if request.config_id:
        if request.config_id not in MOCK_DB["configs"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Configuration with ID {request.config_id} not found",
            )
        config = MOCK_DB["configs"][request.config_id]
    elif request.config:
        config = request.config
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either config_id or config must be provided",
        )

    # As long as we have only one input file per integration, we can just use the source file
    # Determine which input file to use based on precedence:
    # 1. Request source_file
    # 2. Config input_file_example_path
    # 3. Latest file from input_file_prefix_path
    source_file = request.source_file
    if not source_file:
        if config.input_file_example_path:
            source_file = config.input_file_example_path
        else:
            # TODO: Implement logic to get latest file from prefix path
            source_file = config.input_file_prefix_path

    # Get the input data
    input_data = read_csv_from_s3(
        source_file, limit=request.limit if request.preview else None
    )

    # Apply the transformation
    transformed_data = apply_transformation(
        config.nodes, input_data, request.evaluate_node_id
    )

    # If this is a preview request, convert the result to CSV
    preview_csv_data = None
    if request.preview:
        preview_csv_data = convert_to_csv(transformed_data)
    return TransformDataResponse(
        transformed_data=transformed_data.to_csv(index=False),
        preview_csv_data=preview_csv_data,
    )


def apply_transformation(
    nodes: list[Node],
    input_data: pd.DataFrame,
    evaluate_node_id: Optional[str] = None,
) -> pd.DataFrame:
    """
    Apply a transformation configuration to input data.

    Args:
        nodes: List of nodes to evaluate
        input_data: Input data to transform
        evaluate_node_id: ID of the node to evaluate

    Returns:
        Transformed data
    """
    node_map = map_node_id_to_node(nodes)
    evaluate_node = node_map.get(evaluate_node_id, None)
    if not evaluate_node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Node with ID {evaluate_node_id} not found in configuration",
        )
    relevant_tree = select_subtree(evaluate_node, node_map)
    sorted_nodes = topological_sort(relevant_tree)

    # Apply the transformation
    df = pd.DataFrame()
    for node in sorted_nodes:
        if node.type == NodeType.INPUT:
            # We assume we will only have one input node.
            # If there is already data in the current frame, we extend this data by duplication.
            if df.empty:
                df = input_data
            else:
                # The current dataframe will only contain constants.
                # Join to put the constant in every row.
                df = df.join(input_data, how="cross")
            # Rename the columns to a combo of node-id and handle-id
            name_mapping = {
                node.manual_values.column_names[i]: f"{node.id}-column-{i}"
                for i in range(len(node.manual_values.column_names))
            }
            df.rename(columns=name_mapping, inplace=True)
        elif node.type == NodeType.CONSTANT:
            # If the dataframe is empty, we fill in one row with the constant value.
            if df.empty:
                df = pd.DataFrame({node.id: [node.manual_values.constant]})
            else:
                df[node.id] = node.manual_values.constant
        elif node.type == NodeType.STRING_CONCAT:
            # handle to input:
            inputs = {handle.target_handle: handle for handle in node.inputs}
            input_1 = node.manual_values.input_1
            input_2 = node.manual_values.input_2
            if "input-1" in inputs:
                input_1 = df[
                    f"{inputs['input-1'].source_node}-{inputs['input-1'].source_handle}"
                ]
            if "input-2" in inputs:
                input_2 = df[
                    f"{inputs['input-2'].source_node}-{inputs['input-2'].source_handle}"
                ]

            df[f"{node.id}-output"] = input_1 + node.manual_values.separator + input_2
        elif node.type == NodeType.OUTPUT:
            # handle to input:
            inputs = {
                f"{handle.source_node}-{handle.source_handle}": handle.target_handle
                for handle in node.inputs
            }
            # Drop columns that aren't mapped to outputs
            columns_to_keep = list(inputs.keys())
            df = df[columns_to_keep]
            df.rename(columns=inputs, inplace=True)

        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Unsupported node type: {node.type}",
            )
    return df


@router.get(
    "/health",
    summary="Health check endpoint",
    description="Check the health of the transformation service.",
)
async def health_check():
    """
    Health check endpoint.

    Returns:
        JSON response with service status
    """
    return JSONResponse(
        content={
            "status": "ok",
            "environment": settings.ENVIRONMENT,
            "time": datetime.now(UTC).isoformat(),
        }
    )
