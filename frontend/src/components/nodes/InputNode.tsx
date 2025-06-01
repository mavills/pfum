"use client";

import React, { useState, useCallback } from 'react';
import { NodeProps } from '@xyflow/react';
import { InputNodeData } from '../../types';
import NodeWrapper from './NodeWrapper';
import { NodeButton, InputNodeRow } from './components';

const InputNode: React.FC<NodeProps> = ({ data, id }) => {
  const nodeData = data as unknown as InputNodeData;
  const [newColumnName, setNewColumnName] = useState('');
  const [columnNames, setColumnNames] = useState<string[]>(nodeData?.column_names || []);

  const addColumnName = useCallback(() => {
    // if (newColumnName.trim() !== '') {
      const updatedColumnNames = [...columnNames, newColumnName.trim()];
      setColumnNames(updatedColumnNames);
      // Update node data
      if (nodeData) {
        nodeData.column_names = updatedColumnNames;
      }
      setNewColumnName('');
    // }
  }, [columnNames, newColumnName, nodeData]);

  const removeColumnName = useCallback((index: number) => {
    const updatedColumnNames = columnNames.filter((_, i) => i !== index);
    setColumnNames(updatedColumnNames);
    // Update node data
    if (nodeData) {
      nodeData.column_names = updatedColumnNames;
    }
  }, [columnNames, nodeData]);

  const updateColumnName = useCallback((index: number, value: string) => {
    const updatedColumnNames = [...columnNames];
    updatedColumnNames[index] = value;
    setColumnNames(updatedColumnNames);
    // Update node data
    if (nodeData) {
      nodeData.column_names = updatedColumnNames;
    }
  }, [columnNames, nodeData]);

  return (
    <NodeWrapper
      title="Input Node"
      theme="input"
    >
      <div className="text-sm mb-3 text-gray-600">CSV Column Definition</div>
      
      <div className="mb-4">
        <div className="flex">
          {/* <input
            type="text"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            placeholder="Add column name"
            className="flex-grow border border-gray-300 rounded-l p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addColumnName();
              }
            }}
          /> */}
          <NodeButton 
            label="Add"
            onClick={addColumnName}
            primary
            className="rounded-l-none"
          />
        </div>
      </div>

      <div className="mb-2">
        <div className="node-field-label">Columns:</div>
        <div className="node-item-list space-y-2">
          {columnNames.map((column, index) => (
            <InputNodeRow
              key={`${id}-column-${index}`}
              id={id}
              index={index}
              label={column}
              onChange={(value) => updateColumnName(index, value)}
              onDelete={() => removeColumnName(index)}
              outputHandleId={`column-${index}`}
            />
          ))}
        </div>
      </div>
      
      {columnNames.length === 0 && (
        <div className="text-sm text-gray-500 italic">No columns defined</div>
      )}
    </NodeWrapper>
  );
};

export default InputNode; 