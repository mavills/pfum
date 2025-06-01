// JSON Node Configuration Types

export interface NodeInput {
  name: string;
  type: string;
  description: string;
  path: string;
  default?: string | number | boolean;
  required?: boolean;
}

export interface NodeOutput {
  name: string;
  type: string;
  description: string;
  path: string;
}

export interface NodeOperation {
  operation: string;
  kwargs: Record<string, any>;
}

export interface NodeConfiguration {
  name: string;
  description: string;
  inputs: NodeInput[];
  outputs: NodeOutput[];
  operations: NodeOperation[];
  // Optional metadata
  category?: string;
  version?: string;
  author?: string;
  icon?: string;
}

// Runtime node data that stores user inputs and connections
export interface DynamicNodeData {
  type: 'dynamic';
  nodeConfigId: string; // Reference to the configuration
  configName: string; // For display purposes
  inputValues: Record<string, any>; // User-entered values for inputs
  // Store the full config for easy access (could also be fetched by ID)
  config: NodeConfiguration;
}

// Type guard to check if a node is dynamic
export function isDynamicNode(data: any): data is DynamicNodeData {
  return data && data.type === 'dynamic' && data.nodeConfigId;
}

// Helper to get input/output handle IDs
export function getInputHandleId(inputName: string): string {
  return `input-${inputName.toLowerCase().replace(/\s+/g, '-')}`;
}

export function getOutputHandleId(outputName: string): string {
  return `output-${outputName.toLowerCase().replace(/\s+/g, '-')}`;
} 