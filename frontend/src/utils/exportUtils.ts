import { CustomNode, CustomEdge } from "../types";
import {
  NodeType,
  InputNodeData,
  DynamicNodeData,
} from "../types";

/**
 * Processes inputs for a node by filtering edges targeting this node
 */
function processNodeInputs(nodeId: string, edges: CustomEdge[]) {
  return edges
    .filter((edge) => edge.target === nodeId)
    .map((edge) => ({
      id: edge.id,
      source_node: edge.source,
      source_handle: edge.sourceHandle,
      target: edge.target,
      target_handle: edge.targetHandle,
    }));
}

/**
 * Processes outputs for a node by filtering edges originating from this node
 */
function processNodeOutputs(nodeId: string, edges: CustomEdge[]) {
  return edges
    .filter((edge) => edge.source === nodeId)
    .map((edge) => ({
      id: edge.id,
      source_node: edge.source,
      source_handle: edge.sourceHandle,
      target: edge.target,
      target_handle: edge.targetHandle,
    }));
}

/**
 * Gets node-specific manual values based on node type
 */
function getNodeManualValues(node: CustomNode) {
  switch (node.type) {
    case NodeType.INPUT: {
      const inputData = node.data as InputNodeData;
      return {
        column_names: inputData.column_names || [],
        source_file: inputData.source_file,
      };
    }
    case NodeType.DYNAMIC: {
      const dynamicData = node.data as DynamicNodeData;
      return {
        nodeConfigId: dynamicData.nodeConfigId,
        configName: dynamicData.configName,
        inputValues: dynamicData.inputValues,
      };
    }
    default:
      return {};
  }
}

/**
 * Transforms the nodes and edges data into a structured JSON configuration
 * that can be exported and later imported
 */
export function generateConfigJSON(
  nodes: CustomNode[],
  edges: CustomEdge[]
): string {
  // Create a map of nodes by ID for quick lookup
  const nodesMap = new Map<string, CustomNode>();
  nodes.forEach((node) => nodesMap.set(node.id, node));

  // Process each node with a generalized structure
  const processedNodes = nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: {
      x: node.position.x,
      y: node.position.y,
    },
    manual_values: getNodeManualValues(node),
    inputs: processNodeInputs(node.id, edges),
    outputs: processNodeOutputs(node.id, edges),
  }));

  // Create the final configuration object
  const config = {
    version: "1.0",
    nodes: processedNodes,
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      source_handle: edge.sourceHandle,
      target: edge.target,
      target_handle: edge.targetHandle,
    })),
  };

  return JSON.stringify(config, null, 2);
}

/**
 * Validates if the provided JSON configuration is valid
 */
export function validateConfigJSON(jsonString: string): boolean {
  try {
    const config = JSON.parse(jsonString);

    // Basic validation
    if (!config.version || !config.nodes || !Array.isArray(config.nodes)) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}
