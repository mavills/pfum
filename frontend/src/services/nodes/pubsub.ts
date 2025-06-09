import { Node } from "@xyflow/react";
import { Operator } from "../templating/operatorType";
import { NodeType } from "@/types";

// Simple event emitter for configuration changes
type NodeCreateEventListener = (node: Node) => void;

let currentId = 0;

const operatorTypeToNodeType = (operator: Operator): NodeType => {
  if (operator.type === "manual-input") {
    return NodeType.INPUT;
  }
  return NodeType.NORMAL;
};

class NodePubSub {
  private listeners: NodeCreateEventListener[] = [];

  // Add event listener for configuration changes
  addCreateListener(listener: NodeCreateEventListener): void {
    const index = this.listeners.indexOf(listener);
    if (index === -1) {
      this.listeners.push(listener);
    }
  }

  // Remove event listener
  removeListener(listener: NodeCreateEventListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // Notify all listeners of configuration changes
  private notifyListeners(node: Node): void {
    this.listeners.forEach((listener) => listener(node));
  }

  constructNodeFromOperator(
    operator: Operator,
    position: { x: number; y: number },
    id: string | undefined = undefined
  ): Node {
    const nodeType = operatorTypeToNodeType(operator);
    const node: Node = {
      id: id || `operator_${currentId++}`,
      position,
      type: nodeType,
      data: operator as unknown as Record<string, unknown>, // Type assertion for ReactFlow compatibility
    };

    return node;
  }

  addNodeFromOperator(
    operator: Operator,
    position: { x: number; y: number }
  ): void {
    const node = this.constructNodeFromOperator(operator, position);
    this.notifyListeners(node);
  }
}

// Create a singleton instance
export const nodePubSub = new NodePubSub();

export default nodePubSub;
