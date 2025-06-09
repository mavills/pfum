import { NodeProps, Node, useEdges, Edge, useReactFlow } from "@xyflow/react";
import { Operator } from "../../services/templating/operatorType";
import NodeWrapper from "./NodeWrapper";
import NodeRowGroup from "./components/NodeRowGroup";
import { NodeDivider, NodeOutputRow, NodeTextInput } from "./components";
import { useCallback } from "react";

const OperatorNode: React.FC<NodeProps> = (props: NodeProps) => {
  const nodeEdges: Edge[] = useEdges();
  const nodeId = props.id;
  const { setNodes } = useReactFlow();
  const operator = props.data as unknown as Operator;

  const handleInputChange = useCallback(
    (inputId: string, value: any) => {
      setNodes((nodes) =>
        nodes.map((node) => {
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
    [nodeId, operator, setNodes]
  );

  return (
    <NodeWrapper title={operator.title}>
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
