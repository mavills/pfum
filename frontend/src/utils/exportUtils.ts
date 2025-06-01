import { CustomNode, CustomEdge } from "../types";
import {
  NodeType,
  InputNodeData,
  DynamicNodeData,
} from "../types";

/**
 * Creates a complete node export structure preserving original configuration
 * and adding instance-specific data (ID, position, user values)
 */
function createNodeExport(node: CustomNode) {
  const baseNode = {
    id: node.id,
    position: {
      x: node.position.x,
      y: node.position.y,
    },
  };

  switch (node.type) {
    case NodeType.INPUT: {
      const inputData = node.data as InputNodeData;
      return {
        ...baseNode,
        type: "input",
        configuration: {
          name: "CSV Input",
          description: "Input node for CSV data",
          category: "Input",
          inputs: [],
          outputs: (inputData.column_names || []).map((columnName) => ({
            name: columnName,
            type: "string",
            description: `Column: ${columnName}`,
            path: `output.${columnName}`,
          })),
          operations: [
            {
              operation: "read_csv",
              kwargs: {
                file_path: inputData.source_file || "",
                columns: inputData.column_names || [],
              },
            },
          ],
        },
        instance_data: {
          column_names: inputData.column_names || [],
          source_file: inputData.source_file,
        },
      };
    }
    
    case NodeType.DYNAMIC: {
      const dynamicData = node.data as DynamicNodeData;
      return {
        ...baseNode,
        type: "dynamic",
        configuration: dynamicData.config, // Full configuration preserved
        instance_data: {
          nodeConfigId: dynamicData.nodeConfigId,
          configName: dynamicData.configName,
          inputValues: dynamicData.inputValues || {},
        },
      };
    }
    
    default:
      return {
        ...baseNode,
        type: "unknown",
        configuration: {
          name: "Unknown Node",
          description: "Unknown node type",
          inputs: [],
          outputs: [],
          operations: [],
        },
        instance_data: {},
      };
  }
}

/**
 * Creates a clean edge export structure with source/target mapping
 */
function createEdgeExport(edge: CustomEdge) {
  return {
    id: edge.id,
    source: {
      node_id: edge.source,
      output_handle: edge.sourceHandle,
    },
    target: {
      node_id: edge.target,
      input_handle: edge.targetHandle,
    },
  };
}

/**
 * Transforms the nodes and edges data into a structured JSON configuration
 * for downstream processing and API consumption
 */
export function generateGraphExportJSON(
  nodes: CustomNode[],
  edges: CustomEdge[]
): string {
  // Process nodes with full configuration integrity
  const exportedNodes = nodes.map(createNodeExport);
  
  // Process edges with clean source/target mapping
  const exportedEdges = edges.map(createEdgeExport);

  // Create the final export structure
  const graphExport = {
    version: "2.0",
    metadata: {
      exported_at: new Date().toISOString(),
      node_count: nodes.length,
      edge_count: edges.length,
      export_format: "graph",
    },
    nodes: exportedNodes,
    edges: exportedEdges,
  };

  return JSON.stringify(graphExport, null, 2);
}

/**
 * Legacy function for backward compatibility - will be deprecated
 */
export function generateConfigJSON(
  nodes: CustomNode[],
  edges: CustomEdge[]
): string {
  return generateGraphExportJSON(nodes, edges);
}

/**
 * Validates if the provided JSON export is valid
 */
export function validateGraphExportJSON(jsonString: string): boolean {
  try {
    const graphExport = JSON.parse(jsonString);

    // Basic validation
    if (!graphExport.version || !graphExport.nodes || !Array.isArray(graphExport.nodes)) {
      return false;
    }

    if (!graphExport.edges || !Array.isArray(graphExport.edges)) {
      return false;
    }

    // Validate node structure
    for (const node of graphExport.nodes) {
      if (!node.id || !node.type || !node.configuration) {
        return false;
      }
    }

    // Validate edge structure
    for (const edge of graphExport.edges) {
      if (!edge.id || !edge.source || !edge.target) {
        return false;
      }
      if (!edge.source.node_id || !edge.target.node_id) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Legacy validation function for backward compatibility
 */
export function validateConfigJSON(jsonString: string): boolean {
  return validateGraphExportJSON(jsonString);
}

/**
 * Imported node structure from exported JSON
 */
interface ImportedNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  configuration: Record<string, unknown>; // More specific than any
  instance_data: Record<string, unknown>; // More specific than any
}

/**
 * Imported edge structure from exported JSON
 */
interface ImportedEdge {
  id: string;
  source: {
    node_id: string;
    output_handle: string;
  };
  target: {
    node_id: string;
    input_handle: string;
  };
}

/**
 * Imports a graph from exported JSON and converts it back to React Flow format
 */
export function importGraphFromJSON(jsonString: string): {
  nodes: CustomNode[];
  edges: CustomEdge[];
} {
  try {
    const graphExport = JSON.parse(jsonString);
    
    // Validate the import data
    if (!validateGraphExportJSON(jsonString)) {
      throw new Error('Invalid graph export format');
    }
    
    // Convert exported nodes back to React Flow nodes
    const nodes: CustomNode[] = graphExport.nodes.map((exportedNode: ImportedNode) => {
      const baseNode = {
        id: exportedNode.id,
        position: exportedNode.position,
        data: {},
      };
      
      switch (exportedNode.type) {
        case 'input': {
          const instanceData = exportedNode.instance_data as {
            column_names?: string[];
            source_file?: string;
          };
          
          return {
            ...baseNode,
            type: NodeType.INPUT,
            data: {
              label: 'CSV Input',
              type: NodeType.INPUT,
              column_names: instanceData.column_names || [],
              source_file: instanceData.source_file,
            } as InputNodeData,
          };
        }
        
        case 'dynamic': {
          const instanceData = exportedNode.instance_data as {
            nodeConfigId?: string;
            configName?: string;
            inputValues?: Record<string, unknown>;
          };
          
          return {
            ...baseNode,
            type: NodeType.DYNAMIC,
            data: {
              type: 'dynamic',
              nodeConfigId: instanceData.nodeConfigId,
              configName: instanceData.configName,
              inputValues: instanceData.inputValues || {},
              config: exportedNode.configuration as any, // Config structure is flexible
            } as DynamicNodeData,
          };
        }
        
        default:
          throw new Error(`Unknown node type: ${exportedNode.type}`);
      }
    });
    
    // Convert exported edges back to React Flow edges
    const edges: CustomEdge[] = graphExport.edges.map((exportedEdge: ImportedEdge) => ({
      id: exportedEdge.id,
      source: exportedEdge.source.node_id,
      target: exportedEdge.target.node_id,
      sourceHandle: exportedEdge.source.output_handle,
      targetHandle: exportedEdge.target.input_handle,
      animated: false,
      style: { strokeWidth: 2 },
    }));
    
    return { nodes, edges };
    
  } catch (error) {
    throw new Error(`Failed to import graph: ${error instanceof Error ? error.message : String(error)}`);
  }
}
