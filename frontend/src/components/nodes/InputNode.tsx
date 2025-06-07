"use client";

import React, { useState, useCallback } from "react";
import { NodeProps } from "@xyflow/react";
import { InputNodeData } from "../../types";
import NodeWrapper from "./NodeWrapper";
import { InputNodeRow } from "./components";
import NodeRowGroup from "./components/NodeRowGroup";
import NodeCreateColumn from "./components/NodeCreateColumn";

const InputNode: React.FC<NodeProps> = ({ data, id }) => {
  const nodeData = data as unknown as InputNodeData;
  const [newColumnName, setNewColumnName] = useState("");
  const [columnNames, setColumnNames] = useState<string[]>(
    nodeData?.column_names || []
  );

  const addColumnName = useCallback(() => {
    if (newColumnName.trim() !== "") {
      const updatedColumnNames = [...columnNames, newColumnName.trim()];
      setColumnNames(updatedColumnNames);
      // Update node data
      if (nodeData) {
        nodeData.column_names = updatedColumnNames;
      }
      setNewColumnName("");
    }
  }, [columnNames, newColumnName, nodeData]);

  const removeColumnName = useCallback(
    (index: number) => {
      const updatedColumnNames = columnNames.filter((_, i) => i !== index);
      setColumnNames(updatedColumnNames);
      // Update node data
      if (nodeData) {
        nodeData.column_names = updatedColumnNames;
      }
    },
    [columnNames, nodeData]
  );

  const updateColumnName = useCallback(
    (index: number, value: string) => {
      const updatedColumnNames = [...columnNames];
      updatedColumnNames[index] = value;
      setColumnNames(updatedColumnNames);
      // Update node data
      if (nodeData) {
        nodeData.column_names = updatedColumnNames;
      }
    },
    [columnNames, nodeData]
  );

  return (
    <NodeWrapper title="Manual CSV Input">
      {/* Add Column Input */}
      <NodeRowGroup label="Add column:">
        <NodeCreateColumn
          inputValue={newColumnName}
          onChange={(value) => setNewColumnName(value)}
          onSubmit={addColumnName}
        />
      </NodeRowGroup>

      {/* Columns List */}
      {columnNames.length > 0 && (
        <NodeRowGroup label="Columns:">
          {columnNames.map((column, index) => (
            <InputNodeRow
              key={`${id}-column-${index}`}
              label={column}
              onChange={(value) => updateColumnName(index, value)}
              onDelete={() => removeColumnName(index)}
              outputHandleId={`column-${index}`}
              outputDataType="string"
            />
          ))}
        </NodeRowGroup>
      )}
    </NodeWrapper>
  );
};

export default InputNode;
