import { Node } from '@xyflow/react';
import { NodeType, InputNodeData, DynamicNodeData } from '../types';
import { NodeConfiguration, isDynamicNode } from '../types/nodeConfig';
import { nodeConfigService } from '../services/nodeConfigService';
import { areTypesCompatible } from '../components/nodes/HandleStyles';

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
    case NodeType.DYNAMIC:
      // Dynamic nodes should be created using createDynamicNode instead
      throw new Error('Use createDynamicNode for dynamic nodes');
  }
  
  return node;
};

export const createDynamicNode = (
  configId: string,
  position: { x: number; y: number }
): Node => {
  const config = nodeConfigService.getConfiguration(configId);
  if (!config) {
    throw new Error(`Configuration not found: ${configId}`);
  }

  const id = `node_${nodeId++}`;
  const nodeData: DynamicNodeData = {
    type: 'dynamic',
    nodeConfigId: configId,
    configName: config.name,
    inputValues: {},
    config
  };

  return {
    id,
    type: NodeType.DYNAMIC,
    position,
    data: nodeData as any, // Type assertion for ReactFlow compatibility
  };
};

const getNodeLabel = (type: NodeType): string => {
  switch (type) {
    case NodeType.INPUT:
      return 'CSV Input';
    case NodeType.DYNAMIC:
      return 'Dynamic Node';
    default:
      return 'Unknown Node';
  }
};

// Helper to get data type from handle ID and node configuration
function getHandleDataType(
  node: Node,
  handleId: string | null,
  isOutput: boolean
): string | undefined {
  if (!handleId || !node) return undefined;

  // Check if it's a dynamic node
  if (isDynamicNode(node.data)) {
    const config = node.data.config;
    
    if (isOutput) {
      // Find output type by handle ID
      const output = config.outputs.find(output => 
        `output-${output.name.toLowerCase().replace(/\s+/g, '-')}` === handleId
      );
      return output?.type;
    } else {
      // Find input type by handle ID  
      const input = config.inputs.find(input =>
        `input-${input.name.toLowerCase().replace(/\s+/g, '-')}` === handleId
      );
      return input?.type;
    }
  }

  // For legacy nodes, return default types based on node type
  switch (node.type) {
    case NodeType.INPUT:
      return 'string'; // Input nodes output strings
    case NodeType.DYNAMIC:
      return 'string'; // Dynamic nodes - type should be determined from config above
    default:
      return undefined; // Unknown type
  }
}

// Helper to validate if a connection can be created between two nodes
export const isValidConnection = (
  sourceHandle: string | null,
  targetHandle: string | null,
  sourceNode: Node | undefined,
  targetNode: Node | undefined
): boolean => {
  if (!sourceNode || !targetNode) return false;

  // Get data types for the handles
  const sourceType = getHandleDataType(sourceNode, sourceHandle, true);
  const targetType = getHandleDataType(targetNode, targetHandle, false);

  // Use the type compatibility check
  return areTypesCompatible(sourceType, targetType);
};

// Helper to get all available node configurations
export const getAvailableNodeConfigurations = () => {
  return nodeConfigService.getAllConfigurations();
}; 