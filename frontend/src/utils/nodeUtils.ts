import { Node } from '@xyflow/react';
import { NodeType, InputNodeData, OutputNodeData, StringConcatNodeData, EntityType, DynamicNodeData } from '../types';
import { NodeConfiguration } from '../types/nodeConfig';
import { nodeConfigService } from '../services/nodeConfigService';

let nodeId = 0;

export const createNode = (
  type: NodeType,
  position: { x: number; y: number }
): Node => {
  const id = `node_${nodeId++}`;
  
  // Base node properties
  const node: Node = {
    id,
    type,
    position,
    data: { label: getNodeLabel(type), type },
  };
  
  // Add type-specific data
  switch (type) {
    case NodeType.INPUT:
      (node.data as unknown as InputNodeData).column_names = [];
      break;
    case NodeType.OUTPUT:
      (node.data as unknown as OutputNodeData).entity_type = EntityType.COURSES;
      (node.data as unknown as OutputNodeData).field_values = {};
      break;
    case NodeType.STRING_CONCAT:
      (node.data as unknown as StringConcatNodeData).separator = '_';
      (node.data as unknown as StringConcatNodeData).input_1 = '';
      (node.data as unknown as StringConcatNodeData).input_2 = '';
      break;
    case NodeType.DYNAMIC:
      // Dynamic nodes should be created using createDynamicNode instead
      throw new Error('Use createDynamicNode for dynamic nodes');
  }
  
  return node;
};

// New function to create dynamic nodes from configuration
export const createDynamicNode = (
  configId: string,
  position: { x: number; y: number }
): Node => {
  const config = nodeConfigService.getConfiguration(configId);
  if (!config) {
    throw new Error(`Node configuration not found: ${configId}`);
  }

  const id = `node_${nodeId++}`;
  
  // Initialize input values with defaults
  const inputValues: Record<string, any> = {};
  config.inputs.forEach(input => {
    if (input.default !== undefined) {
      inputValues[input.name] = input.default;
    }
  });

  const nodeData: DynamicNodeData = {
    type: 'dynamic',
    nodeConfigId: configId,
    configName: config.name,
    inputValues,
    config
  };

  return {
    id,
    type: NodeType.DYNAMIC,
    position,
    data: nodeData as any, // Type assertion for ReactFlow compatibility
  };
};

export const getNodeLabel = (type: NodeType): string => {
  switch (type) {
    case NodeType.INPUT:
      return 'Input';
    case NodeType.OUTPUT:
      return 'Output';
    case NodeType.STRING_CONCAT:
      return 'String Concat';
    case NodeType.DYNAMIC:
      return 'Dynamic Node';
    default:
      return 'Unknown Node';
  }
};

// Helper to validate if a connection can be created between two nodes
export const isValidConnection = (
  sourceHandle: string | null,
  targetHandle: string | null,
  sourceNode: Node | undefined,
  targetNode: Node | undefined
): boolean => {
  if (!sourceNode || !targetNode) return false;

  // All inputs and outputs are strings in this app, so we're mainly 
  // checking that we're connecting from an output to an input
  // Future: Add actual type checking logic here based on input/output types
  
  return true;
};

// Helper to get all available node configurations
export const getAvailableNodeConfigurations = () => {
  return nodeConfigService.getAllConfigurations();
}; 