import { CustomNode, CustomEdge } from '../types';
import { 
  NodeType, 
  NodeData, 
  InputNodeData, 
  OutputNodeData, 
  StringConcatNodeData 
} from '../types';

/**
 * Processes inputs for a node by filtering edges targeting this node
 */
function processNodeInputs(nodeId: string, edges: CustomEdge[]) {
  return edges
    .filter(edge => edge.target === nodeId)
    .map(edge => ({
      id: edge.id,
      sourceNode: edge.source,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
    }));
}

/**
 * Processes outputs for a node by filtering edges originating from this node
 */
function processNodeOutputs(nodeId: string, edges: CustomEdge[]) {
  return edges
    .filter(edge => edge.source === nodeId)
    .map(edge => ({
      id: edge.id,
      sourceHandle: edge.sourceHandle,
      target: edge.target,
      targetHandle: edge.targetHandle,
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
        columnNames: inputData.columnNames || [],
      };
    }
    case NodeType.OUTPUT: {
      const outputData = node.data as OutputNodeData;
      return {
        entityType: outputData.entityType,
      };
    }
    case NodeType.STRING_CONCAT: {
      const stringConcatData = node.data as StringConcatNodeData;
      return {
        separator: stringConcatData.separator,
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
export function generateConfigJSON(nodes: CustomNode[], edges: CustomEdge[]): string {
  // Create a map of nodes by ID for quick lookup
  const nodesMap = new Map<string, CustomNode>();
  nodes.forEach(node => nodesMap.set(node.id, node));
  
  // Process each node with a generalized structure
  const processedNodes = nodes.map(node => ({
    id: node.id,
    type: node.type,
    position: node.position,
    manual_values: getNodeManualValues(node),
    inputs: processNodeInputs(node.id, edges),
    outputs: processNodeOutputs(node.id, edges),
  }));
  
  // Create the final configuration object
  const config = {
    version: "1.0",
    nodes: processedNodes,
    edges: edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      sourceHandle: edge.sourceHandle,
      target: edge.target,
      targetHandle: edge.targetHandle,
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