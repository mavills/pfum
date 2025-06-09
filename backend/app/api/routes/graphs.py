from fastapi import APIRouter, HTTPException, status

from app.api.schemas.graphs import (
    ProcessGraphRequest,
    ProcessGraphResponse,
    PreviewGraphRequest,
    PreviewGraphResponse
)
from app.services.graph_service import graph_service
from app.core.logger import get_logger

logger = get_logger("api.graphs")
router = APIRouter()


@router.post(
    "/process",
    response_model=ProcessGraphResponse,
    summary="Process exported graph",
    description="Process an exported graph from the frontend and generate execution plan"
)
async def process_graph(request: ProcessGraphRequest):
    """
    Process an exported graph and create an execution plan.
    
    This endpoint takes a graph exported from the frontend (using exportUtils.ts),
    analyzes the structure, performs topological sorting, and returns an ordered
    list of operations that can be executed.
    """
    logger.info(f"Processing graph with {len(request.graph.nodes)} nodes")
    
    try:
        return graph_service.process_graph(request.graph)
    except ValueError as e:
        logger.error(f"Graph processing error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Graph processing failed: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error processing graph: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while processing graph"
        )


@router.post(
    "/preview",
    response_model=PreviewGraphResponse,
    summary="Preview graph execution",
    description="Process graph and return preview data for the first N rows"
)
async def preview_graph_execution(request: PreviewGraphRequest):
    """
    Process a graph and return preview data.
    
    This endpoint processes the graph similar to the main processing endpoint,
    but executes operations on only the first N rows of data to provide a
    preview of the transformation results.
    """
    logger.info(f"Creating preview for graph with {len(request.graph.nodes)} nodes, limit: {request.preview_limit}")
    
    try:
        return graph_service.preview_graph(request.graph, request.preview_limit)
    except ValueError as e:
        logger.error(f"Graph preview error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Graph preview failed: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in graph preview: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while creating preview"
        )


@router.get(
    "/health",
    summary="Graph service health check",
    description="Check if the graph processing service is healthy"
)
async def graph_health_check():
    """
    Health check endpoint for graph processing service.
    """
    return {
        "status": "healthy",
        "service": "graph_processing",
        "message": "Graph processing service is operational"
    } 