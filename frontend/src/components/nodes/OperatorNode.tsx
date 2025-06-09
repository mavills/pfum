import { NodeProps, Node, useEdges, Edge } from "@xyflow/react";
import { Operator } from "../../services/templating/operatorType";
import NodeWrapper from "./NodeWrapper";
import NodeRowGroup from "./components/NodeRowGroup";
import { NodeDivider, NodeOutputRow, NodeTextInput } from "./components";
import { useCallback, useState } from "react";

const OperatorNode: React.FC<NodeProps> = (props: NodeProps) => {
  const nodeData = props.data as unknown as Operator;
  const nodeEdges: Edge[] = useEdges();
  const nodeId = props.id;

  const [inputValues, setInputValues] = useState<Record<string, any>>(
    nodeData.inputs.reduce((acc, input) => {
      acc[input.id] = input.default;
      return acc;
    }, {} as Record<string, any>)
  );

  const handleInputChange = useCallback((inputId: string, value: any) => {
    nodeData.inputs.find((input) => input.id === inputId)!.value = value;
    setInputValues((prev) => ({ ...prev, [inputId]: value }));
  }, []);

  return (
    <NodeWrapper title={nodeData.title}>
      {/* Inputs */}
      {nodeData.inputs.length > 0 && (
        <NodeRowGroup label="Inputs:">
          {nodeData.inputs.map((input) => (
            <NodeTextInput
              key={input.id}
              label={input.name}
              value={inputValues[input.id]}
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
      {nodeData.outputs.length > 0 && (
        <NodeRowGroup label="Outputs:">
          {nodeData.outputs.map((output) => (
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
            <div>Config ID: {nodeData.id}</div>
            <div>Category: {nodeData.category || "Uncategorized"}</div>
            <div>Operations: {nodeData.config.steps.length}</div>
          </div>
        </details>
      )}
    </NodeWrapper>
  );
};
export default OperatorNode;
