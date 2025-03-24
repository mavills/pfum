import { Node as XYNode, Edge as XYEdge } from '@xyflow/react';

export type CustomNode = XYNode;
export type CustomEdge = XYEdge;

export enum NodeType {
  INPUT = 'input',
  OUTPUT = 'output',
  STRING_CONCAT = 'stringConcat',
}

export interface BaseNodeData {
  type: NodeType;
}

export interface InputNodeData extends BaseNodeData {
  type: NodeType.INPUT;
  columnNames: string[];
}

export interface OutputNodeData extends BaseNodeData {
  type: NodeType.OUTPUT;
  entityType: EntityType;
  fieldValues: Record<string, string>;
}

export interface StringConcatNodeData extends BaseNodeData {
  type: NodeType.STRING_CONCAT;
  separator: string;
  inputValues: Record<string, string>;
}

export enum EntityType {
  COURSES = 'courses',
  EMPLOYEES = 'employees',
}

export type RFState = {
  nodes: CustomNode[];
  edges: CustomEdge[];
  nodeTypes: NodeTypes;
}; 