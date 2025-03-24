"use client";

import React, { useState, useCallback } from 'react';
import { NodeProps as XYNodeProps, useEdges, Edge } from '@xyflow/react';
import { StringConcatNodeData } from '../../types';
import NodeWrapper from './NodeWrapper';
import { handleColors } from './HandleStyles';
import { NodeTextInput, NodeOutputRow } from './components';

const StringConcatNode: React.FC<XYNodeProps> = ({ data, id }) => {
  const nodeData = data as StringConcatNodeData;
  const [separator, setSeparator] = useState<string>(nodeData?.separator || '_');
  const [inputValues, setInputValues] = useState<Record<string, string>>(
    nodeData?.inputValues || {}
  );
  const edges = useEdges();
  
  // Update node data when separator changes
  const handleSeparatorChange = useCallback((newSeparator: string) => {
    setSeparator(newSeparator);
    if (nodeData) {
      nodeData.separator = newSeparator;
    }
  }, [nodeData]);

  // Update input value
  const handleInputChange = useCallback((inputId: string, value: string) => {
    setInputValues(prev => {
      const newValues = { ...prev, [inputId]: value };
      if (nodeData) {
        nodeData.inputValues = newValues;
      }
      return newValues;
    });
  }, [nodeData]);
  
  // Check if inputs are connected
  const isSeparatorConnected = edges.some(
    (edge: Edge) => edge.target === id && edge.targetHandle === 'separator'
  );
  
  const isInput1Connected = edges.some(
    (edge: Edge) => edge.target === id && edge.targetHandle === 'input-1'
  );
  
  const isInput2Connected = edges.some(
    (edge: Edge) => edge.target === id && edge.targetHandle === 'input-2'
  );

  return (
    <NodeWrapper
      title="String Concat"
      headerColor={handleColors.stringConcat}
    >
      <div className="text-sm mb-3 text-gray-600">Concatenate Strings</div>

      {/* Separator Input */}
      <NodeTextInput
        label="Separator"
        value={separator}
        onChange={handleSeparatorChange}
        hasInput={true}
        inputHandleId="separator"
        nodeType="stringConcat"
        isConnected={isSeparatorConnected}
        className="mb-2"
      />

      {/* Input 1 */}
      <NodeTextInput
        label="Input 1"
        value={inputValues['input-1'] || ''}
        onChange={(value) => handleInputChange('input-1', value)}
        hasInput={true}
        inputHandleId="input-1"
        nodeType="stringConcat"
        isConnected={isInput1Connected}
        className="mb-2"
      />
      
      {/* Input 2 */}
      <NodeTextInput
        label="Input 2"
        value={inputValues['input-2'] || ''}
        onChange={(value) => handleInputChange('input-2', value)}
        hasInput={true}
        inputHandleId="input-2"
        nodeType="stringConcat"
        isConnected={isInput2Connected}
        className="mb-2"
      />

      {/* Output */}
      <NodeOutputRow
        label="Output"
        outputHandleId="output"
        nodeType="stringConcat"
      />
    </NodeWrapper>
  );
};

export default StringConcatNode; 