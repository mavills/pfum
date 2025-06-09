import { Node } from "@xyflow/react";
import { NodeType } from "../types";
import { isDynamicNode } from "../types/nodeConfig";

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
      const output = config.outputs.find(
        (output) =>
          `output-${output.name.toLowerCase().replace(/\s+/g, "-")}` ===
          handleId
      );
      return output?.type;
    } else {
      // Find input type by handle ID
      const input = config.inputs.find(
        (input) =>
          `input-${input.name.toLowerCase().replace(/\s+/g, "-")}` === handleId
      );
      return input?.type;
    }
  }

  // For legacy nodes, return default types based on node type
  switch (node.type) {
    case NodeType.INPUT:
      return "string"; // Input nodes output strings
    case NodeType.NORMAL:
      return "string"; // Dynamic nodes - type should be determined from config above
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
  // TODO: Remove this once we have a proper type compatibility check
  return true;
  // return areTypesCompatible(sourceType, targetType);
};
