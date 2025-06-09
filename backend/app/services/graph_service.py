from typing import List, Dict, Any, Optional
import polars as pl
from pathlib import Path

from app.core.logger import get_logger
from app.api.schemas.graphs import (
    ExportedGraph, 
    ProcessGraphResponse, 
    PreviewGraphResponse
)
from app.services.file_service import file_service

logger = get_logger("services.graph")


class GraphService:
    """Service for processing exported graphs and creating execution plans."""
    
    def __init__(self):
        pass
    
    def process_graph(self, graph: ExportedGraph) -> ProcessGraphResponse:
        """
        Process an exported graph and create an execution plan.
        
        Args:
            graph: Exported graph from frontend
            
        Returns:
            ProcessGraphResponse with operations and execution plan
        """
        logger.info(f"Processing graph with {len(graph.nodes)} nodes and {len(graph.edges)} edges")
        
        # Convert to internal representation similar to DAG processing
        node_dict = self._create_node_dict(graph)
        
        # Build dependency graph
        dependency_graph = self._build_dependency_graph(graph.nodes, graph.edges)
        
        # Topologically sort nodes for execution order
        execution_order = self._topological_sort(dependency_graph)
        
        # Generate operations list
        operations = self._generate_operations(graph.nodes, execution_order)
        
        # Create execution plan
        execution_plan = {
            "execution_order": execution_order,
            "dependencies": dependency_graph,
            "node_count": len(graph.nodes),
            "edge_count": len(graph.edges)
        }
        
        return ProcessGraphResponse(
            operations=operations,
            execution_plan=execution_plan
        )
    
    def preview_graph(self, graph: ExportedGraph, preview_limit: int = 20) -> PreviewGraphResponse:
        """
        Process graph and return preview data.
        
        Args:
            graph: Exported graph from frontend
            preview_limit: Number of rows to preview
            
        Returns:
            PreviewGraphResponse with preview data
        """
        logger.info(f"Creating preview for graph with {len(graph.nodes)} nodes")
        
        # First process the graph to get operations
        process_result = self.process_graph(graph)
        
        # Execute operations with preview limit (placeholder implementation)
        preview_data = self._execute_preview_operations(
            process_result.operations, 
            preview_limit
        )
        
        metadata = {
            "preview_limit": preview_limit,
            "timestamp": graph.metadata.exported_at,
            "node_count": len(graph.nodes),
            "processed_operations": len(process_result.operations)
        }
        
        return PreviewGraphResponse(
            preview_data=preview_data,
            operations=process_result.operations,
            metadata=metadata
        )
    
    def _create_node_dict(self, graph: ExportedGraph) -> Dict[str, Any]:
        """Create a dictionary mapping node IDs to node data."""
        return {node.id: node for node in graph.nodes}
    
    def _build_dependency_graph(self, nodes: List[Any], edges: List[Any]) -> Dict[str, List[str]]:
        """
        Build dependency graph from nodes and edges.
        
        Returns:
            Dict mapping node_id to list of nodes it depends on
        """
        dependencies = {node.id: [] for node in nodes}
        
        for edge in edges:
            # Target node depends on source node
            if edge.target_node_id in dependencies:
                dependencies[edge.target_node_id].append(edge.source_node_id)
        
        return dependencies
    
    def _topological_sort(self, dependency_graph: Dict[str, List[str]]) -> List[str]:
        """
        Topologically sort nodes based on dependencies.
        
        Args:
            dependency_graph: Dict mapping node_id to list of dependencies
            
        Returns:
            List of node IDs in execution order
        """
        # Calculate in-degrees
        in_degree = {node: len(deps) for node, deps in dependency_graph.items()}
        
        # Initialize queue with nodes that have no dependencies
        queue = [node for node, degree in in_degree.items() if degree == 0]
        result = []
        
        while queue:
            # Remove node with no incoming edges
            current = queue.pop(0)
            result.append(current)
            
            # For each node that depends on current node, reduce its in-degree
            for node, deps in dependency_graph.items():
                if current in deps:
                    in_degree[node] -= 1
                    if in_degree[node] == 0:
                        queue.append(node)
        
        if len(result) != len(dependency_graph):
            raise ValueError("Graph contains a cycle and cannot be processed")
        
        return result
    
    def _generate_operations(self, nodes: List[Any], execution_order: List[str]) -> List[Dict[str, Any]]:
        """
        Generate operations list from nodes in execution order.
        
        Args:
            nodes: List of graph nodes
            execution_order: Ordered list of node IDs
            
        Returns:
            List of operation dictionaries
        """
        node_dict = {node.id: node for node in nodes}
        operations = []
        
        for node_id in execution_order:
            node = node_dict[node_id]
            
            # Create operation based on node type and operator
            operation = {
                "node_id": node_id,
                "type": node.type,
                "operation_type": self._determine_operation_type(node),
                "parameters": self._extract_operation_parameters(node),
                "inputs": self._get_node_inputs(node),
                "outputs": self._get_node_outputs(node)
            }
            
            operations.append(operation)
        
        return operations
    
    def _determine_operation_type(self, node: Any) -> str:
        """Determine the type of operation based on node configuration."""
        if node.type == "input":
            return "read_csv"
        elif hasattr(node, 'operator') and 'type' in node.operator:
            return node.operator.get('type', 'unknown')
        else:
            return "unknown"
    
    def _extract_operation_parameters(self, node: Any) -> Dict[str, Any]:
        """Extract operation parameters from node configuration."""
        if hasattr(node, 'operator'):
            # Extract config steps or other parameters
            operator = node.operator
            if isinstance(operator, dict) and 'config' in operator:
                return operator['config']
        
        return {}
    
    def _get_node_inputs(self, node: Any) -> List[str]:
        """Get input definitions for a node."""
        if hasattr(node, 'operator') and isinstance(node.operator, dict):
            inputs = node.operator.get('inputs', [])
            return [inp.get('id', '') for inp in inputs if isinstance(inp, dict)]
        return []
    
    def _get_node_outputs(self, node: Any) -> List[str]:
        """Get output definitions for a node."""
        if hasattr(node, 'operator') and isinstance(node.operator, dict):
            outputs = node.operator.get('outputs', [])
            return [out.get('id', '') for out in outputs if isinstance(out, dict)]
        return []
    
    def _execute_preview_operations(
        self, 
        operations: List[Dict[str, Any]], 
        preview_limit: int
    ) -> Dict[str, Any]:
        """
        Execute operations with preview limit (placeholder implementation).
        
        This is where you would plug in your actual execution logic.
        For now, returns mock preview data.
        
        Args:
            operations: List of operations to execute
            preview_limit: Number of rows to preview
            
        Returns:
            Dict containing preview data for each operation
        """
        preview_data = {}
        
        for i, operation in enumerate(operations):
            node_id = operation["node_id"]
            operation_type = operation["operation_type"]
            
            # Placeholder logic - replace with actual execution
            if operation_type == "read_csv":
                preview_data[node_id] = self._mock_csv_preview(operation, preview_limit)
            else:
                preview_data[node_id] = self._mock_operation_preview(operation, preview_limit)
        
        return preview_data
    
    def _mock_csv_preview(self, operation: Dict[str, Any], limit: int) -> Dict[str, Any]:
        """Mock CSV preview for placeholder implementation."""
        return {
            "type": "csv_input",
            "rows_preview": f"First {limit} rows would be loaded from CSV",
            "estimated_columns": ["column_1", "column_2", "column_n"],
            "operation": operation["operation_type"]
        }
    
    def _mock_operation_preview(self, operation: Dict[str, Any], limit: int) -> Dict[str, Any]:
        """Mock operation preview for placeholder implementation."""
        return {
            "type": operation["operation_type"],
            "preview": f"Operation {operation['operation_type']} would process {limit} rows",
            "parameters": operation["parameters"],
            "node_id": operation["node_id"]
        }


# Global instance
graph_service = GraphService() 