import { Node } from '@xyflow/react';
import { NodeType, InputNodeData, OutputNodeData, StringConcatNodeData, EntityType } from '../types';

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
      (node.data as InputNodeData).columnNames = [];
      break;
    case NodeType.OUTPUT:
      (node.data as OutputNodeData).entityType = EntityType.COURSES;
      break;
    case NodeType.STRING_CONCAT:
      (node.data as StringConcatNodeData).separator = '_';
      break;
  }
  
  return node;
};

export const getNodeLabel = (type: NodeType): string => {
  switch (type) {
    case NodeType.INPUT:
      return 'Input';
    case NodeType.OUTPUT:
      return 'Output';
    case NodeType.STRING_CONCAT:
      return 'String Concat';
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
  // Future: Add actual type checking logic here
  
  return true;
}; 