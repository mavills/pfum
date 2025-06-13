import logging
import sys
import os
from typing import Any

import structlog
from structlog.stdlib import ProcessorFormatter

# Get environment from env var (default to development)
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")


def configure_logging() -> None:
    """
    Configure structlog for application logging.
    
    Different configurations are applied based on the ENVIRONMENT:
    - development: Human-readable, colorful logs to stdout
    - production: JSON formatted logs for better parsing in log aggregation systems
    """
    # Configure standard logging first
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=logging.INFO,
    )

    # Set log level for other libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").handlers = []
    
    # Define processors for structlog
    shared_processors: list[Any] = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]
    
    if ENVIRONMENT == "development":
        # Development: pretty, human-readable logs
        processors = shared_processors + [
            structlog.dev.ConsoleRenderer(colors=True)
        ]
        structlog.configure(
            processors=processors,
            wrapper_class=structlog.stdlib.BoundLogger,
            logger_factory=structlog.stdlib.LoggerFactory(),
            cache_logger_on_first_use=True,
        )
    else:
        # Production: JSON logs for better parsing
        formatter = ProcessorFormatter(
            processor=structlog.processors.JSONRenderer(),
            foreign_pre_chain=shared_processors,
        )
        
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(formatter)
        
        root_logger = logging.getLogger()
        root_logger.handlers = [handler]
        
        structlog.configure(
            processors=shared_processors + [
                structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
            ],
            logger_factory=structlog.stdlib.LoggerFactory(),
            wrapper_class=structlog.stdlib.BoundLogger,
            cache_logger_on_first_use=True,
        )
    
    # Create a logger for our application
    logger = structlog.get_logger("app")
    logger.info("Logging configured", environment=ENVIRONMENT)


def get_logger(name: str = "app") -> structlog.stdlib.BoundLogger:
    """
    Get a structlog logger instance with the given name.
    
    Args:
        name (str): Name of the logger, used for context

    Returns:
        structlog.stdlib.BoundLogger: A configured logger instance
    """
    return structlog.get_logger(name) 