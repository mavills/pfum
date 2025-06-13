import { Edge, Node, Position } from "@xyflow/react";
import { Operator } from "../templating/operatorType";

/**
 * Creates a complete node export structure preserving original configuration
 * and adding instance-specific data (ID, position, user values)
 */
function createNodeExport(node: Node) {
  const operator = node.data as unknown as Operator;
  return {
    id: node.id,
    type: node.type,
    position: node.position,
    operator: operator,
  };
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

export function generateGraphExportJSON(nodes: Node[], edges: Edge[]): string {
  const graphExport = generateGraphExport(nodes, edges);
  return JSON.stringify(graphExport, null, 2);
}

/**
 * Transforms the nodes and edges data into a structured JSON configuration
 * for downstream processing and API consumption
 */
export function generateGraphExport(nodes: Node[], edges: Edge[]) {
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

  return graphExport;
}
