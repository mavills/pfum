from typing import Optional
from pydantic import BaseModel, ConfigDict


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
