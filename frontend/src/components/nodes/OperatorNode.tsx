import {
  NodeProps,
  useEdges,
  Edge,
  useReactFlow,
  Connection,
} from "@xyflow/react";
import { Operator } from "../../services/templating/operatorType";
import NodeWrapper from "./NodeWrapper";
import NodeRowGroup from "./components/NodeRowGroup";
import { NodeDivider, NodeOutputRow, NodeTextInput } from "./components";
import { useCallback } from "react";
import { generateGraphExport } from "@/services/serialization/exportUtils";
import { operatorApi } from "@/services/templating/operatorApi";

const OperatorNode: React.FC<NodeProps> = (props: NodeProps) => {
  const nodeEdges: Edge[] = useEdges();
  const nodeId = props.id;
  const reactFlowInstance = useReactFlow();
  const operator = props.data as unknown as Operator;

  const handleInputChange = useCallback(
    (inputId: string, value: any) => {
      reactFlowInstance.setNodes((nodes) =>
        nodes.map((node) => {
          // Update the value of the input in the operator when a connection is made
          if (node.id === nodeId) {
            const updatedOperator = {
              ...operator,
              inputs: operator.inputs.map((input) =>
                input.id === inputId ? { ...input, value } : input
              ),
            };
            return {
              ...node,
              data: updatedOperator,
            };
          }
          return node;
        })
      );
    },
    [nodeId, operator, reactFlowInstance.setNodes]
  );

  const handleConnectionChange = async (connection: Connection) => {
    // Update the value of the input in the operator when a connection is made
    // This is done through calling the API, and asking for an update on the data.
    const graphExport = generateGraphExport(
      reactFlowInstance.getNodes(),
      reactFlowInstance.getEdges()
    );
    const updatedOperator = await operatorApi.updateNode(nodeId, graphExport);
    reactFlowInstance.setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: updatedOperator };
        }
        return node;
      })
    );
  };

  return (
    <NodeWrapper
      title={operator.title}
      onConnectionChange={handleConnectionChange}
    >
      {/* Inputs */}
      {operator.inputs.length > 0 && (
        <NodeRowGroup label="Inputs:">
          {operator.inputs.map((input) => (
            <NodeTextInput
              key={input.id}
              label={input.name}
              value={input.value}
              onChange={(value) => handleInputChange(input.id, value)}
              placeholder={input.default}
              isEditable={input.editable}
              inputHandleId={input.id}
              inputDataType={input.type}
              isConnected={nodeEdges.some(
                (edge) =>
                  edge.target === nodeId && edge.targetHandle === input.id
              )}
            />
          ))}
        </NodeRowGroup>
      )}
      <NodeDivider />

      {/* Outputs */}
      {operator.outputs.length > 0 && (
        <NodeRowGroup label="Outputs:">
          {operator.outputs.map((output) => (
            <NodeOutputRow
              key={output.id}
              label={output.name}
              outputHandleId={output.id}
              outputDataType={output.type}
            />
          ))}
        </NodeRowGroup>
      )}

      {/* Debug info (optional, can be hidden in production) */}
      {process.env.NODE_ENV === "development" && (
        <details className="mt-4">
          <summary className="text-xs text-gray-400 cursor-pointer">
            Debug Info
          </summary>
          <div className="text-xs text-gray-400 mt-2">
            <div>Config ID: {operator.id}</div>
            <div>Category: {operator.category || "Uncategorized"}</div>
            <div>Operations: {operator.config.steps.length}</div>
          </div>
        </details>
      )}
    </NodeWrapper>
  );
};
export default OperatorNode;
