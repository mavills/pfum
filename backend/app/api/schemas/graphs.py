from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class GraphPosition(BaseModel):
    """Position of a node in the graph."""
    x: float
    y: float


class GraphEdge(BaseModel):
    """Edge definition in exported graph."""
    id: str
    source_node_id: str
    target_node_id: str
    source_handle_id: Optional[str] = None
    target_handle_id: Optional[str] = None


class GraphNode(BaseModel):
    """Node definition in exported graph."""
    id: str
    type: str
    position: GraphPosition
    operator: Dict[str, Any] = Field(description="Full operator configuration")


class GraphMetadata(BaseModel):
    """Metadata for exported graph."""
    exported_at: str
    node_count: int
    edge_count: int
    export_format: str


class ExportedGraph(BaseModel):
    """Complete exported graph structure from frontend."""
    version: str
    metadata: GraphMetadata
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class ProcessGraphRequest(BaseModel):
    """Request model for processing a graph."""
    graph: ExportedGraph = Field(description="Exported graph from frontend")


class ProcessGraphResponse(BaseModel):
    """Response model for processed graph."""
    operations: List[Dict[str, Any]] = Field(description="Ordered list of operations to execute")
    execution_plan: Dict[str, Any] = Field(description="Execution plan with dependencies")


class PreviewGraphRequest(BaseModel):
    """Request model for graph preview."""
    graph: ExportedGraph = Field(description="Exported graph from frontend")
    preview_limit: int = Field(default=20, ge=1, le=100, description="Number of rows to preview")


class PreviewGraphResponse(BaseModel):
    """Response model for graph preview."""
    preview_data: Dict[str, Any] = Field(description="Preview results for each node")
    operations: List[Dict[str, Any]] = Field(description="Operations that would be executed")
    metadata: Dict[str, Any] = Field(description="Processing metadata") 