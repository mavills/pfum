import { Edge, Node } from "@xyflow/react";
import { CustomNode, CustomEdge } from "../../types";
import { NodeType, InputNodeData, DynamicNodeData } from "../../types";
import { Operator } from "../templating/operatorType";

/**
 * Creates a complete node export structure preserving original configuration
 * and adding instance-specific data (ID, position, user values)
 */
function createNodeExport(node: Node) {
  const baseNode = {
    id: node.id,
    position: {
      x: node.position.x,
      y: node.position.y,
    },
  };
  const operator = node.data as unknown as Operator;
  return {
    id: node.id,
    operator: operator,
  };

  switch (node.type) {
    case NodeType.INPUT: {
      const inputData = node.data as unknown as InputNodeData;
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

    case NodeType.NORMAL: {
      const dynamicData = node.data as unknown as DynamicNodeData;
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
function createEdgeExport(edge: Edge) {
  return {
    id: edge.id,
    source_node_id: edge.source,
    target_node_id: edge.target,
    source_handle_id: edge.sourceHandle,
    target_handle_id: edge.targetHandle,
  };
}

/**
 * Transforms the nodes and edges data into a structured JSON configuration
 * for downstream processing and API consumption
 */
export function generateGraphExportJSON(nodes: Node[], edges: Edge[]): string {
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
