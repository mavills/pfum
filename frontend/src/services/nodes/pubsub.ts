import { Node } from "@xyflow/react";
import operatorPubSub from "../templating/pubsub";

// Simple event emitter for configuration changes
type NodeCreateEventListener = (node: Node) => void;

let currentId = 0;

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

  createNodeFromTemplate(
    operatorId: string,
    position: { x: number; y: number }
  ): void {
    const operator = operatorPubSub.getOperator(operatorId);
    if (!operator) {
      throw new Error(`Operator not found: ${operatorId}`);
    }

    const node: Node = {
      id: `operator_${currentId++}`,
      position,
      type: "normal",
      data: operator as unknown as Record<string, unknown>, // Type assertion for ReactFlow compatibility
    };

    this.notifyListeners(node);
  }
}

// Create a singleton instance
export const nodePubSub = new NodePubSub();

export default nodePubSub;
