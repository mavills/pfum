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
    if (newColumnName.trim() !== '') {
      const updatedColumnNames = [...columnNames, newColumnName.trim()];
      setColumnNames(updatedColumnNames);
      // Update node data
      if (nodeData) {
        nodeData.column_names = updatedColumnNames;
      }
      setNewColumnName('');
    }
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
      title="CSV Input"
      theme="transformation"
    >
      {/* Description */}
      <div className="text-sm mb-3 text-gray-600">Define CSV column structure</div>
      
      {/* Add Column Input */}
      <div className="mb-4">
        <div className="node-field-label">Add Column:</div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            placeholder="Column name"
            className="form-input flex-grow text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addColumnName();
              }
            }}
          />
          <NodeButton 
            label="Add"
            onClick={addColumnName}
            primary
          />
        </div>
      </div>

      {/* Columns List */}
      {columnNames.length > 0 && (
        <div className="mb-2">
          <div className="node-field-label">Columns:</div>
          <div className="space-y-2">
            {columnNames.map((column, index) => (
              <InputNodeRow
                key={`${id}-column-${index}`}
                id={id}
                index={index}
                label={column}
                onChange={(value) => updateColumnName(index, value)}
                onDelete={() => removeColumnName(index)}
                outputHandleId={`column-${index}`}
                outputDataType="string"
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {columnNames.length === 0 && (
        <div className="text-sm text-gray-500 italic text-center py-2">
          No columns defined yet
        </div>
      )}

      {/* Source File Info */}
      {nodeData?.source_file && (
        <div className="mt-4 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-400">
            Source: {nodeData.source_file.split('/').pop()}
          </div>
        </div>
      )}
    </NodeWrapper>
  );
};

export default InputNode; 