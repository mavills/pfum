from typing import Dict, List, Any, Optional, Union
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict


class NodeType(str, Enum):
    """Types of nodes in a transformation flow."""

    INPUT = "input"
    OUTPUT = "output"
    CONSTANT = "constant"
    STRING_CONCAT = "string_concat"


class Position(BaseModel):
    """Position of a node in the flow editor."""

    x: float
    y: float


class ConnectionHandle(BaseModel):
    """Model for a connection between nodes."""

    """Unique identifier for the connection."""
    id: str

    """ID of the source node for this connection."""
    source_node: Optional[str] = None

    """Handle identifier on the source node where the connection starts."""
    source_handle: Optional[str] = None

    """ID of the target node for this connection."""
    target: Optional[str] = None

    """Handle identifier on the target node where the connection ends."""
    target_handle: Optional[str] = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "edge-1",
                "source_node": "node-1",
                "source_handle": "output-1",
                "target": "node-2",
                "target_handle": "input-1",
            }
        }
    )


class Edge(BaseModel):
    """Model for an edge connecting two nodes."""

    id: str
    source: str
    source_handle: Optional[str] = Field(None)
    target: str
    target_handle: Optional[str] = Field(None)


# Node-specific manual values models
class InputNodeManualValues(BaseModel):
    """Manual values specific to input nodes."""

    column_names: List[str] = Field(default_factory=list)


class OutputNodeManualValues(BaseModel):
    """Manual values specific to output nodes."""

    entity_type: str = Field(default="courses")


class StringConcatNodeManualValues(BaseModel):
    """Manual values specific to string concatenation nodes."""

    separator: str = Field(default="_")
    input_1: str = Field(default="")
    input_2: str = Field(default="")


# Union type for all possible manual values
NodeManualValues = Union[
    InputNodeManualValues,
    OutputNodeManualValues,
    StringConcatNodeManualValues,
    # Dict[str, Any],
]


class GraphNode(BaseModel):
    """Unified model for all node types."""

    id: str
    type: NodeType
    position: Position
    manual_values: NodeManualValues = Field(default_factory=dict)
    inputs: List[ConnectionHandle] = Field(default_factory=list)
    outputs: List[ConnectionHandle] = Field(default_factory=list)

    degree: int = Field(default=0)

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "node-1",
                "type": "input",
                "position": {"x": 100, "y": 100},
                "manual_values": {"columnNames": ["name", "email"]},
                "inputs": [],
                "outputs": [
                    {
                        "id": "edge-1",
                        "sourceHandle": "column-0",
                        "target": "output-1",
                        "targetHandle": "name",
                    }
                ],
            }
        }
    )


# Request and Response Models
class TransformationConfig(BaseModel):
    """Request model for saving a transformation configuration."""

    config_id: str = Field(
        description="Unique identifier for this transformation configuration",
    )
    version: str = Field(
        description="Version number of the transformation configuration"
    )
    description: str = Field(description="Description of what this transformation does")
    input_file_example_path: Optional[str] = Field(
        description="Path to an example input file used for previews and validation. If not set, uses latest file from input_file_prefix_path",
        default=None,
    )
    input_file_prefix_path: str = Field(
        description="Base path prefix where input files will be located",
    )
    output_file_prefix_path: str = Field(
        description="Base path prefix where output files will be saved",
    )

    nodes: List[GraphNode]
    edges: List[Edge]

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "config_id": "customer-data-transform-v1",
                "version": "1.0",
                "description": "Transforms customer data from legacy format to new schema",
                "input_file_example_path": "/data/examples/customer_data.csv",
                "input_file_prefix_path": "/data/input/",
                "output_file_prefix_path": "/data/output/",
                "nodes": [
                    {
                        "id": "input-1",
                        "type": "input",
                        "position": {"x": 100, "y": 100},
                        "manual_values": {"columnNames": ["name", "email"]},
                        "inputs": [],
                        "outputs": [
                            {
                                "id": "edge-1",
                                "sourceHandle": "column-0",
                                "target": "output-1",
                                "targetHandle": "name",
                            }
                        ],
                    }
                ],
                "edges": [
                    {
                        "id": "edge-1",
                        "source": "input-1",
                        "sourceHandle": "column-0",
                        "target": "output-1",
                        "targetHandle": "name",
                    }
                ],
            }
        }
    )


class TransformRequest(BaseModel):
    """Request model for transforming data using a saved configuration."""

    config_id: Optional[str] = Field(
        None,
        description="ID of a saved transformation config. Mutually exclusive with 'config' field",
    )
    config: Optional[TransformationConfig] = Field(
        None,
        description="Direct transformation config object. Mutually exclusive with 'config_id' field",
    )

    evaluate_node_id: Optional[str] = Field(
        None,
        description="Node ID for which to evaluate and return output",
    )
    preview: bool = Field(
        default=False, description="Whether this is a preview operation"
    )
    limit: Optional[int] = Field(
        default=100, ge=1, le=1000, description="Number of rows to process for preview"
    )
    source_file: Optional[str] = Field(
        None,
        description="Path to the source file to use for transformation. If not provided, uses the latest file from input_file_prefix_path",
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "config_id": "customer-data-transform-v1",
                "evaluate_node_id": "output-1",
                "preview": True,
                "limit": 10,
            }
        }
    )


class PreviewResponse(BaseModel):
    """Response model for preview transformations."""

    preview_csv_data: str = Field(description="Base64 encoded CSV data")


class TransformDataResponse(BaseModel):
    """Response model for transformed data."""

    transformed_data: str
    preview_csv_data: Optional[str] = Field(
        None, description="Base64 encoded CSV data, only present in preview mode"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "transformed_data": [
                    {"id": 1, "name": "John Doe", "user_email": "john@example.com"},
                    {"id": 2, "name": "Jane Smith", "user_email": "jane@example.com"},
                ],
                "preview_csv_data": None,
            }
        }
    )
