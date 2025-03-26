import os
from typing import Dict, Any

from app.core.config import settings

# Get environment from env var (default to development)
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

def get_uvicorn_config() -> Dict[str, Any]:
    """
    Get the uvicorn configuration based on the current environment.
    
    Returns:
        Dict[str, Any]: The uvicorn configuration
    """
    # Base configuration shared across environments
    config = {
        "app": "app.main:app",
        "host": settings.HOST,
        "port": settings.PORT,
        "workers": 1,
        "log_level": settings.LOG_LEVEL,
        "reload": settings.RELOAD,
    }
    
    # Environment-specific configuration
    if settings.is_development:
        config.update({
            "workers": 1,    # Single worker for easier debugging
            "log_level": "debug",
        })
    else:  # production
        config.update({
            "workers": int(os.getenv("WORKERS", 2)),  # Default to 2 workers in production
            "log_level": "warning",
        })
    
    return config


if __name__ == "__main__":
    # This allows running with python -m app.core.uvicorn
    import uvicorn
    
    config = get_uvicorn_config()
    uvicorn.run(
        config["app"],
        host=config["host"],
        port=config["port"],
        workers=config["workers"],
        log_level=config["log_level"],
        reload=config["reload"],
    ) 