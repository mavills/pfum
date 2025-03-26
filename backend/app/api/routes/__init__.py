from fastapi import APIRouter

from app.api.routes.transform import router as transform_router
from app.api.routes.s3 import router as s3_router

# Create a parent router that combines all route modules
api_router = APIRouter()

# Include all route modules
api_router.include_router(transform_router, prefix="/transform", tags=["transform"])
api_router.include_router(s3_router, prefix="/s3", tags=["s3"])

# Add more routers here as the application grows
# api_router.include_router(users_router, prefix="/users", tags=["users"])
# api_router.include_router(auth_router, prefix="/auth", tags=["auth"]) 