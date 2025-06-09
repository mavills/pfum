#!/usr/bin/env python3
"""
Test script for the new refactored API.
Run this after starting the server to test all endpoints.
"""

import requests
import json
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
TEST_CSV_PATH = "test_data.csv"


def create_test_csv():
    """Create a test CSV file for demonstration."""
    csv_content = """name,email,age,department
John Doe,john@example.com,30,Engineering
Jane Smith,jane@example.com,25,Marketing
Bob Wilson,bob@example.com,35,Sales
Alice Brown,alice@example.com,28,Engineering"""
    
    with open(TEST_CSV_PATH, "w") as f:
        f.write(csv_content)
    print(f"Created test CSV: {TEST_CSV_PATH}")


def test_health_endpoints():
    """Test health check endpoints."""
    print("\n=== Testing Health Endpoints ===")
    
    # Main API health
    response = requests.get(f"{BASE_URL}/health")
    print(f"API Health: {response.status_code} - {response.json()}")
    
    # Graph service health
    response = requests.get(f"{BASE_URL}/graphs/health")
    print(f"Graph Service Health: {response.status_code} - {response.json()}")


def test_file_upload():
    """Test file upload and node generation."""
    print("\n=== Testing File Upload ===")
    
    # Upload CSV file
    with open(TEST_CSV_PATH, "rb") as f:
        files = {"file": (TEST_CSV_PATH, f, "text/csv")}
        response = requests.post(f"{BASE_URL}/files/upload", files=files)
    
    if response.status_code != 200:
        print(f"Upload failed: {response.status_code} - {response.text}")
        return None
    
    upload_result = response.json()
    print(f"Upload successful: {upload_result}")
    
    file_id = upload_result["file_id"]
    
    # Get file info
    response = requests.get(f"{BASE_URL}/files/{file_id}/info")
    print(f"File info: {response.json()}")
    
    # Preview CSV
    response = requests.post(f"{BASE_URL}/files/preview", json={
        "file_id": file_id,
        "limit": 3
    })
    print(f"CSV preview: {response.json()}")
    
    # Generate node template
    response = requests.post(f"{BASE_URL}/files/generate-node-template", json={
        "file_id": file_id,
        "node_title": "Employee Data Input",
        "node_description": "Input node for employee CSV data"
    })
    
    if response.status_code == 200:
        template_result = response.json()
        print(f"Generated node template with {len(template_result['operator']['outputs'])} outputs")
        return file_id, template_result
    else:
        print(f"Template generation failed: {response.status_code} - {response.text}")
        return file_id, None


def test_graph_processing():
    """Test graph processing endpoints."""
    print("\n=== Testing Graph Processing ===")
    
    # Mock exported graph structure (based on frontend export format)
    mock_graph = {
        "version": "2.0",
        "metadata": {
            "exported_at": "2024-01-01T12:00:00Z",
            "node_count": 2,
            "edge_count": 1,
            "export_format": "graph"
        },
        "nodes": [
            {
                "id": "input-1",
                "type": "input",
                "position": {"x": 100, "y": 100},
                "operator": {
                    "title": "CSV Input",
                    "type": "csv_input",
                    "outputs": [
                        {"id": "name", "type": "string", "name": "Name"},
                        {"id": "email", "type": "string", "name": "Email"}
                    ]
                }
            },
            {
                "id": "transform-1", 
                "type": "transform",
                "position": {"x": 300, "y": 100},
                "operator": {
                    "title": "String Transform",
                    "type": "string_transform",
                    "inputs": [
                        {"id": "input_text", "type": "string", "name": "Input Text"}
                    ],
                    "outputs": [
                        {"id": "output_text", "type": "string", "name": "Output Text"}
                    ]
                }
            }
        ],
        "edges": [
            {
                "id": "edge-1",
                "source_node_id": "input-1",
                "target_node_id": "transform-1",
                "source_handle_id": "name",
                "target_handle_id": "input_text"
            }
        ]
    }
    
    # Test graph processing
    response = requests.post(f"{BASE_URL}/graphs/process", json={
        "graph": mock_graph
    })
    
    if response.status_code == 200:
        result = response.json()
        print(f"Graph processed successfully:")
        print(f"  Operations: {len(result['operations'])}")
        print(f"  Execution order: {result['execution_plan']['execution_order']}")
    else:
        print(f"Graph processing failed: {response.status_code} - {response.text}")
    
    # Test graph preview
    response = requests.post(f"{BASE_URL}/graphs/preview", json={
        "graph": mock_graph,
        "preview_limit": 5
    })
    
    if response.status_code == 200:
        result = response.json()
        print(f"Graph preview successful:")
        print(f"  Preview nodes: {len(result['preview_data'])}")
        print(f"  Operations: {len(result['operations'])}")
    else:
        print(f"Graph preview failed: {response.status_code} - {response.text}")


def main():
    """Run all tests."""
    print("Testing Refactored TransformatAPI")
    print("=================================")
    
    # Create test data
    create_test_csv()
    
    # Run tests
    test_health_endpoints()
    test_file_upload()
    test_graph_processing()
    
    # Cleanup
    Path(TEST_CSV_PATH).unlink(missing_ok=True)
    print("\nTest completed!")


if __name__ == "__main__":
    main() 