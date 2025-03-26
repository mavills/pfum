// Define our own simplified types for ReactFlow compatibility
export type CustomNode = any;
export type CustomEdge = any;

export enum NodeType {
  INPUT = 'input',
  OUTPUT = 'output',
  STRING_CONCAT = 'string_concat',
}

export interface BaseNodeData {
  type: NodeType;
}

export interface InputNodeData extends BaseNodeData {
  type: NodeType.INPUT;
  column_names: string[];
  source_file?: string; // S3 file path for the input data
}

export interface OutputNodeData extends BaseNodeData {
  type: NodeType.OUTPUT;
  entity_type: EntityType;
  field_values: Record<string, string>;
}

export interface StringConcatNodeData extends BaseNodeData {
  type: NodeType.STRING_CONCAT;
  separator: string;
  input_1: string;
  input_2: string;
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