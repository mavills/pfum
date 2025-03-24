# Transformat API

A FastAPI-based backend for transforming CSV data using visual transformation flows.

## Technology Choices

### Core Framework: FastAPI

**Why FastAPI?**

- **Performance**: Built on Starlette and Pydantic, FastAPI is one of the fastest Python web frameworks available
- **Type Safety**: Native integration with Python type hints, providing automatic validation and documentation
- **Documentation**: Automatic API documentation with Swagger UI and ReDoc
- **Modern**: Leverages modern Python features (3.7+) and best practices
- **Async Support**: First-class support for asynchronous request handling

### Validation and Data Models: Pydantic

**Why Pydantic?**

- **Schema Validation**: Strong validation with clear error messages
- **Serialization/Deserialization**: Easy conversion between Python objects and JSON
- **Integration**: Deep integration with FastAPI for request/response validation
- **Performance**: Compiled with Cython for high performance validation

### Logging: Structlog

**Why Structlog?**

- **Structured Logs**: Outputs logs in a structured format (JSON in production)
- **Context**: Makes it easy to add context to log messages
- **Flexibility**: Works well in both human-readable development and machine-parseable production environments
- **Integration**: Seamlessly integrates with Python's standard logging

### Serverless: Mangum

**Why Mangum?**

- **AWS Lambda Support**: Enables running FastAPI applications in AWS Lambda
- **Simple Adapter**: Minimal overhead for translating between Lambda events and ASGI
- **Flexibility**: Optional component that doesn't affect local development
- **Maintenance**: Actively maintained and compatible with latest FastAPI versions

### Development Server: Uvicorn

**Why Uvicorn?**

- **ASGI Compatible**: Designed specifically for ASGI frameworks like FastAPI
- **Performance**: High-performance server built on uvloop and httptools
- **Hot Reload**: Supports automatic reloading during development
- **Configuration**: Flexible configuration for different environments

## Environment-Based Configuration

The application has environment-specific behavior controlled by the `ENVIRONMENT` environment variable:

### Development Mode (`ENVIRONMENT=development`)

- Colorful, human-readable logging output
- Hot reload enabled in the development server
- Extended debug information in API responses
- More verbose logging

### Production Mode (`ENVIRONMENT=production`)

- JSON-formatted logs for easier parsing by log aggregation tools
- Optimized server settings for performance
- No hot reload
- Minimal debug information in responses
- More focused, warning-level logging

## Directory Structure

```
backend/
│
├── app/                      # Application package
│   ├── api/                  # API endpoints and schemas
│   │   ├── routes/           # Route handlers
│   │   └── schemas/          # Pydantic models
│   │
│   ├── core/                 # Core application components
│   │   ├── config.py         # Application settings
│   │   ├── logger.py         # Logging configuration
│   │   └── uvicorn.py        # Uvicorn server configuration
│   │
│   └── main.py               # FastAPI application initialization
│
├── lambda_handler.py         # AWS Lambda handler (optional)
├── run.py                    # Development server script
└── requirements.txt          # Python dependencies
```

## Getting Started

### Installation

```bash
# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Running the API Locally

```bash
# Run the development server
python run.py
```

### Running on AWS Lambda

The application can be deployed as an AWS Lambda function using the provided `lambda_handler.py`. This handler uses Mangum to adapt the FastAPI application for Lambda.

1. Package the application according to AWS Lambda requirements
2. Configure the Lambda function to use `lambda_handler.lambda_handler` as the handler
3. Set the `ENVIRONMENT` environment variable to `production`

## API Documentation

When running locally, API documentation is available at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc 