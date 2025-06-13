#!/usr/bin/env python
"""
Development server script.

This script runs the FastAPI application using uvicorn for local development.
"""
import os
import uvicorn

from app.uvicorn import get_uvicorn_config

if __name__ == "__main__":
    # Set environment to development if not specified
    if "ENVIRONMENT" not in os.environ:
        os.environ["ENVIRONMENT"] = "development"
    
    # Get uvicorn config and run server
    config = get_uvicorn_config()
    print(f"Starting development server at http://{config['host']}:{config['port']}")
    print(f"Environment: {os.environ.get('ENVIRONMENT')}")
    print("Press Ctrl+C to stop the server")
    
    uvicorn.run(
        config["app"],
        host=config["host"],
        port=config["port"],
        reload=config["reload"],
        log_level=config["log_level"],
    ) 