import { Node, Edge } from "@xyflow/react";
import {
  NodeType,
  InputNodeData,
  DynamicNodeData,
  CustomNode,
  CustomEdge,
} from "../../types";
import { Operator } from "../templating/operatorType";
import nodePubSub from "../nodes/pubsub";

/**
 * Imported node structure from exported JSON
 */
interface ImportedNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  operator: Operator;
}

/**
 * Imported edge structure from exported JSON
 */
interface ImportedEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  source_handle_id: string;
  target_handle_id: string;
}

/**
 * TODO: Validates if the provided JSON export is valid
 */

/**
 * Imports a graph from exported JSON and converts it back to React Flow format
 */
export function importGraphFromJSON(jsonString: string): {
  nodes: Node[];
  edges: Edge[];
} {
  try {
    const graphExport = JSON.parse(jsonString);

    // Validate the import data
    // if (!validateGraphExportJSON(jsonString)) {
    //   throw new Error("Invalid graph export format");
    // }

    // Convert exported nodes back to React Flow nodes
    const nodes: Node[] = graphExport.nodes.map(
      (exportedNode: ImportedNode) => {
        const baseNode = {
          id: exportedNode.id,
          type: exportedNode.type,
          position: exportedNode.position,
          data: exportedNode.operator,
        };
        const node = nodePubSub.constructNodeFromOperator(
          exportedNode.operator,
          exportedNode.position
        );
        return node;
      }
    );

    // Convert exported edges back to React Flow edges
    const edges: Edge[] = graphExport.edges.map(
      (exportedEdge: ImportedEdge) => ({
        id: exportedEdge.id,
        source: exportedEdge.source_node_id,
        target: exportedEdge.target_node_id,
        sourceHandle: exportedEdge.source_handle_id,
        targetHandle: exportedEdge.target_handle_id,
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
