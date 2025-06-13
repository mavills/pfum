from fastapi import APIRouter

from app.api.routes.files import router as files_router
from app.api.routes.graphs import router as graphs_router
from app.api.routes.nodes import router as nodes_router

# Create a parent router that combines all route modules
api_router = APIRouter()

# Include new clean API routes
api_router.include_router(nodes_router, prefix="/nodes", tags=["nodes"])
api_router.include_router(files_router, prefix="/files", tags=["files"])
api_router.include_router(graphs_router, prefix="/graphs", tags=["graphs"])


# Health check endpoint for the entire API
@api_router.get("/health", tags=["health"])
async def api_health_check():
    """
    API health check endpoint.
    """
    return {
        "status": "healthy",
        "message": "TransformatAPI is operational",
        "version": "2.0",
    }
