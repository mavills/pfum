from dataclasses import dataclass
from typing import Any, Optional

from app.logger import get_logger
from app.api.schemas.graphs import (
    ExportedGraph,
    GraphNode,
)

logger = get_logger("services.graph")


@dataclass
class InternalEdge:
    source_node_id: str
    source_handle_id: str
    target_node_id: str
    target_handle_id: str


@dataclass
class InternalNode:
    id: str
    type: str
    operator: dict[str, Any]
    input_index: int
    inputs: list[InternalEdge]
    outputs: list[InternalEdge]
    degree: int

    def get_parent_ids(self) -> list[str]:
        return [input.source_node_id for input in self.inputs]


class GraphService:
    """Service for processing exported graphs and creating execution plans."""

    def __init__(self, graph: ExportedGraph):
        self.graph = graph
        self.internal_graph = self._to_internal_graph(graph)
        self.selected_subtree = self.internal_graph

    @staticmethod
    def _to_internal_graph(graph: ExportedGraph) -> dict[str, InternalNode]:
        """
        Convert an exported graph to an internal graph.
        """
        internal_graph = {}
        for node_index, node in enumerate(graph.nodes):
            internal_graph[node.id] = InternalNode(
                id=node.id,
                type=node.type,
                operator=node.operator,
                input_index=node_index,
                inputs=[],
                outputs=[],
                degree=0,
            )
        for edge in graph.edges:
            internal_graph[edge.target_node_id].inputs.append(
                InternalEdge(
                    edge.source_node_id,
                    edge.source_handle_id,
                    edge.target_node_id,
                    edge.target_handle_id,
                )
            )
            internal_graph[edge.source_node_id].outputs.append(
                InternalEdge(
                    edge.source_node_id,
                    edge.source_handle_id,
                    edge.target_node_id,
                    edge.target_handle_id,
                )
            )

        return internal_graph

    def select_subtree(
        self, node_id: str, subtree: Optional[dict[str, InternalNode]] = None
    ) -> dict[str, InternalNode]:
        """
        Select a subtree of the graph rooted at the given node.
        """
        if subtree is None:
            subtree = {}
        parents = {node_id: self.internal_graph[node_id]}
        for parent_id in self.internal_graph[node_id].get_parent_ids():
            if parent_id in subtree:
                # already included, no need to go further
                continue
            subtree = self.select_subtree(parent_id, subtree)
            parents.update(subtree)
        self.selected_subtree = parents
        return parents

    def topological_sort(self) -> list[GraphNode]:
        """
        Topologically sort the given nodes.
        """
        input_nodes = self.selected_subtree.copy()
        sorted_nodes: list[InternalNode] = []
        queue: list[InternalNode] = []
        # Add degree to each node
        for node in input_nodes.values():
            node.degree = len(node.inputs)

        # add all nodes with degree 0 to the queue
        for node in input_nodes.values():
            if node.degree == 0:
                queue.append(node)
        # Clear the input nodes added to the queue from the input nodes list
        for node in queue:
            input_nodes.pop(node.id)

        while len(queue) > 0:
            # remove the first node from the queue
            node = queue.pop()
            # add the node to the sorted list
            sorted_nodes.append(node)
            # for each output of the node, decrement the degree of the target node
            for output_handle in node.outputs:
                if output_handle.target_node_id not in input_nodes:
                    # Happens when the target node is not in the subgraph.
                    continue
                input_nodes[output_handle.target_node_id].degree -= 1
                # if the target node has degree 0, add it to the queue
                if input_nodes[output_handle.target_node_id].degree == 0:
                    queue.append(input_nodes.pop(output_handle.target_node_id))
            # if there are still nodes in the input nodes list, the graph contains a cycle and cannot be topologically sorted
            if len(input_nodes) > 0 and len(queue) == 0:
                raise ValueError(
                    "Graph contains a cycle and cannot be topologically sorted"
                )

        return [self.graph.nodes[n.input_index] for n in sorted_nodes]
