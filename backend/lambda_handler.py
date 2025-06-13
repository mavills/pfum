import os
import json
from mangum import Mangum

# Import the FastAPI application
from app.main import app
from app.logger import get_logger

# Set up logger
logger = get_logger("lambda_handler")

# Check if running in Lambda environment
IS_LAMBDA = os.environ.get("AWS_EXECUTION_ENV") is not None

# Set environment
if IS_LAMBDA and os.environ.get("ENVIRONMENT") != "development":
    os.environ["ENVIRONMENT"] = "production"

# Create the handler
handler = Mangum(app, lifespan="off")

# Add custom middleware for Lambda-specific handling
def lambda_handler(event, context):
    """
    AWS Lambda handler function.
    
    Args:
        event: The AWS Lambda Event
        context: The AWS Lambda Context
    
    Returns:
        dict: The HTTP response
    """
    # Log the request (but sanitize sensitive headers)
    sanitized_event = event.copy()
    if "headers" in sanitized_event and sanitized_event["headers"] is not None:
        headers = sanitized_event["headers"].copy()
        for header in ["Authorization", "Cookie", "X-Api-Key"]:
            if header.lower() in [h.lower() for h in headers]:
                headers = {k: v if k.lower() != header.lower() else "REDACTED" 
                           for k, v in headers.items()}
        sanitized_event["headers"] = headers
    
    logger.info("Lambda request received", 
                aws_request_id=getattr(context, "aws_request_id", "unknown"),
                path=event.get("path"),
                http_method=event.get("httpMethod"))
    
    # Set API Gateway compatibility flag
    is_apigateway = "requestContext" in event and "apiId" in event["requestContext"]
    
    # Process the event with Mangum
    response = handler(event, context)
    
    # Log the response (excluding the body for brevity)
    log_response = {k: v for k, v in response.items() if k != "body"}
    logger.info("Lambda response", 
                status_code=response.get("statusCode"),
                response_metadata=log_response)
    
    return response 