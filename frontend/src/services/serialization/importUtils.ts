import {
  NodeType,
  InputNodeData,
  DynamicNodeData,
  CustomNode,
  CustomEdge,
} from "../../types";

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
 * Validates if the provided JSON export is valid
 */
export function validateGraphExportJSON(jsonString: string): boolean {
  try {
    const graphExport = JSON.parse(jsonString);

    // Basic validation
    if (
      !graphExport.version ||
      !graphExport.nodes ||
      !Array.isArray(graphExport.nodes)
    ) {
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
      throw new Error("Invalid graph export format");
    }

    // Convert exported nodes back to React Flow nodes
    const nodes: CustomNode[] = graphExport.nodes.map(
      (exportedNode: ImportedNode) => {
        const baseNode = {
          id: exportedNode.id,
          position: exportedNode.position,
          data: {},
        };

        switch (exportedNode.type) {
          case "input": {
            const instanceData = exportedNode.instance_data as {
              column_names?: string[];
              source_file?: string;
            };

            return {
              ...baseNode,
              type: NodeType.INPUT,
              data: {
                label: "CSV Input",
                type: NodeType.INPUT,
                column_names: instanceData.column_names || [],
                source_file: instanceData.source_file,
              } as InputNodeData,
            };
          }

          case "dynamic": {
            const instanceData = exportedNode.instance_data as {
              nodeConfigId?: string;
              configName?: string;
              inputValues?: Record<string, unknown>;
            };

            return {
              ...baseNode,
              type: NodeType.NORMAL,
              data: {
                type: "dynamic",
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
      }
    );

    // Convert exported edges back to React Flow edges
    const edges: CustomEdge[] = graphExport.edges.map(
      (exportedEdge: ImportedEdge) => ({
        id: exportedEdge.id,
        source: exportedEdge.source.node_id,
        target: exportedEdge.target.node_id,
        sourceHandle: exportedEdge.source.output_handle,
        targetHandle: exportedEdge.target.input_handle,
        animated: false,
        style: { strokeWidth: 2 },
      })
    );

    return { nodes, edges };
  } catch (error) {
    throw new Error(
      `Failed to import graph: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
