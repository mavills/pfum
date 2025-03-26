from app.api.schemas.transform import Node

#################################################################
# 1. Figure out all the nodes linked to the node to be evaluated.
#################################################################


def select_subtree(
    evaluate_node: Node, nodes: dict[str, Node], subtree: dict[str, Node] = {}
) -> dict[str, Node]:
    """
    Find all nodes that are parents of the given node and the given node itself.

    Args:
        evaluate_node: The node to evaluate.
        nodes: A dictionary of node id to node.

    Returns:
        A dictionary of node id to node that are parents of the given node.
    """
    # Include the node to evaluate itself
    parents = {evaluate_node.id: evaluate_node}

    # Include all parents of the node to evaluate
    for input in get_parents(evaluate_node, nodes).values():
        if input.id in subtree:
            continue
        subtree = select_subtree(input, nodes, parents)
        parents.update(subtree)
    return parents


#################################################################
# 2. Topologically sort the nodes.
#################################################################

# Topological Sorting:
#
# Add all nodes with in-degree 0 to a queue.
# While the queue is not empty:
#   Remove a node from the queue.
#   For each outgoing edge from the removed node, decrement the in-degree of the destination node by 1.
#   If the in-degree of a destination node becomes 0, add it to the queue.
#   If the queue is empty and there are still nodes in the graph, the graph contains a cycle and cannot be topologically sorted.
#   The nodes in the queue represent the topological ordering of the graph.

# To apply the sorting to our graph, we need to prepare the graph first.
# The end result is a list of nodes to execute in order.


def topological_sort(nodes: dict[str, Node]) -> list[Node]:
    """
    Topologically sort the given nodes.
    """
    input_nodes = nodes.copy()
    sorted_nodes: list[Node] = []
    queue: list[Node] = []
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
            if output_handle.target not in input_nodes:
                continue
            input_nodes[output_handle.target].degree -= 1
            # if the target node has degree 0, add it to the queue
            if input_nodes[output_handle.target].degree == 0:
                queue.append(input_nodes.pop(output_handle.target))
        # if there are still nodes in the input nodes list, the graph contains a cycle and cannot be topologically sorted
        if len(input_nodes) > 0 and len(queue) == 0:
            raise ValueError(
                "Graph contains a cycle and cannot be topologically sorted"
            )

    return sorted_nodes


#################################################################
# Utils:
#################################################################


def map_node_id_to_node(nodes: list[Node]) -> dict[str, Node]:
    """
    Map a list of nodes to a dictionary of node id to node.
    """
    return {node.id: node for node in nodes}


def get_parents(node: Node, nodes: dict[str, Node]) -> dict[str, Node]:
    """
    Get all parents of the given node.
    """
    parents = {}
    for input in node.inputs:
        parents[input.source_node] = nodes[input.source_node]
    return parents
