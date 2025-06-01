// Define our own simplified types for ReactFlow compatibility
export type CustomNode = any;
export type CustomEdge = any;

export enum NodeType {
  INPUT = 'input',
  DYNAMIC = 'dynamic',
}

export interface BaseNodeData {
  type: NodeType;
}

export interface InputNodeData extends BaseNodeData {
  type: NodeType.INPUT;
  column_names: string[];
  source_file?: string; // S3 file path for the input data
}

export enum EntityType {
  COURSES = 'courses',
  EMPLOYEES = 'employees',
}

export type RFState = {
  nodes: CustomNode[];
  edges: CustomEdge[];
  node_types: Record<string, any>;
};

// Re-export the dynamic node types
export type { DynamicNodeData, NodeConfiguration, NodeInput, NodeOutput } from './nodeConfig'; 