# TransformatAPI v2.0 - Refactored Backend

## Overview

This is a comprehensive refactor of the backend API, designed with senior-level architecture principles:

- **Clean separation of concerns**: Routes, Services, and Schemas are properly decoupled
- **Type-safe contracts**: Schemas mirror frontend types for consistency
- **Sensible endpoint structure**: RESTful design with logical grouping
- **Local file storage**: Removed premature S3 complexity
- **Pluggable execution**: Easy to extend with actual operation logic

## API Structure

### Endpoints Overview

```
/api/v1/
├── /health                    # API health check
├── /files/                    # File operations
│   ├── POST /upload          # Upload CSV file
│   ├── POST /generate-node-template  # Generate operator from CSV
│   ├── POST /preview         # Preview CSV contents
│   └── GET /{file_id}/info   # Get file information
└── /graphs/                   # Graph processing
    ├── POST /process         # Process exported graph
    ├── POST /preview         # Preview graph execution
    └── GET /health           # Graph service health
```

## Core Functionality

### 1. CSV Upload & Node Generation

**Upload CSV File**
```bash
curl -X POST http://localhost:8000/api/v1/files/upload \
  -F "file=@data.csv"
```

**Generate Node Template**
```bash
curl -X POST http://localhost:8000/api/v1/files/generate-node-template \
  -H "Content-Type: application/json" \
  -d '{
    "file_id": "uuid-here",
    "node_title": "Custom Input Node",
    "node_description": "Description here"
  }'
```

This creates an `Operator` schema that matches your frontend types, with outputs for each CSV column.

### 2. Graph Processing

**Process Exported Graph**
```bash
curl -X POST http://localhost:8000/api/v1/graphs/process \
  -H "Content-Type: application/json" \
  -d '{
    "graph": {
      "version": "2.0",
      "metadata": {...},
      "nodes": [...],
      "edges": [...]
    }
  }'
```

This takes graphs exported from your frontend (`exportUtils.ts`) and creates an execution plan.

**Preview Graph Execution**
```bash
curl -X POST http://localhost:8000/api/v1/graphs/preview \
  -H "Content-Type: application/json" \
  -d '{
    "graph": {...},
    "preview_limit": 20
  }'
```

Processes only the first 20 rows for preview purposes.

## Architecture

### Directory Structure

```
backend/app/
├── api/
│   ├── routes/           # Route handlers (thin layer)
│   │   ├── files.py      # File upload endpoints
│   │   └── graphs.py     # Graph processing endpoints
│   └── schemas/          # Pydantic models
│       ├── operator.py   # Mirrors frontend Operator interface
│       ├── files.py      # File operation schemas
│       └── graphs.py     # Graph processing schemas
├── services/             # Business logic (thick layer)
│   ├── file_service.py   # CSV processing, node generation
│   └── graph_service.py  # Graph analysis, DAG processing
└── core/                 # Configuration, logging, utilities
```

### Key Design Principles

1. **Schema Consistency**: `operator.py` exactly mirrors your frontend `operatorType.ts`
2. **Service Layer**: Business logic separated from HTTP concerns
3. **Error Handling**: Proper HTTP status codes and error messages
4. **Type Safety**: Full Pydantic validation on all inputs/outputs
5. **Extensibility**: Easy to plug in actual execution logic

## Integration Points

### Frontend Integration

The API is designed to work seamlessly with your existing frontend:

1. **File Upload**: Upload CSV → Get file_id → Generate node template
2. **Graph Export**: Export graph with `exportUtils.ts` → Send to `/graphs/process`
3. **Preview**: Same graph → Send to `/graphs/preview` for testing

### Execution Plugin Point

In `graph_service.py`, look for `_execute_preview_operations()`. This is where you plug in your actual execution logic:

```python
def _execute_preview_operations(self, operations: List[Dict], limit: int):
    # Replace this mock implementation with your actual execution engine
    for operation in operations:
        if operation["operation_type"] == "read_csv":
            # Execute CSV read with polars
            pass
        elif operation["operation_type"] == "transform":
            # Execute transformation
            pass
    # Return actual results instead of mock data
```

## Testing

Run the test script to verify all functionality:

```bash
cd backend
python test_new_api.py
```

This tests:
- File upload and node generation
- CSV preview
- Graph processing and preview
- All health checks

## Key Improvements

### From Old API
- ❌ S3 coupling removed
- ❌ Mixed concerns in routes
- ❌ Inconsistent schemas
- ❌ Poor error handling

### To New API
- ✅ Local file storage
- ✅ Clean service layer
- ✅ Type-safe schemas matching frontend
- ✅ Proper HTTP status codes
- ✅ Comprehensive logging
- ✅ Easy to extend and test

## Installation

```bash
cd backend
pip install -r requirements.txt
python run.py
```

The API will be available at `http://localhost:8000` with interactive docs at `/docs`.

## Next Steps

1. **Plug in Execution Logic**: Replace mock implementations in `graph_service.py`
2. **Add Authentication**: Extend with auth middleware if needed
3. **Database Integration**: Replace in-memory file registry with persistent storage
4. **Error Recovery**: Add retry logic and better error recovery
5. **Performance**: Add caching and async processing for large files

This refactored API provides a solid foundation that can scale with your application's growth. 