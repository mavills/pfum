import operatorPubSub from "../templating/pubsub";

let currentId = 0;

export const createFromTemplate = (
  operatorId: string,
  position: { x: number; y: number }
) => {
  const operator = operatorPubSub.getOperator(operatorId);
  if (!operator) {
    throw new Error(`Operator not found: ${operatorId}`);
  }

  return {
    id: `node_${currentId++}`,
    position,
    type: "normal",
    data: operator as unknown as Record<string, unknown>, // Type assertion for ReactFlow compatibility
  };
};
