"use client";

import React, { useState, useCallback } from 'react';
import { NodeProps as XYNodeProps, useEdges, Edge } from '@xyflow/react';
import { StringConcatNodeData } from '../../types';
import NodeWrapper from './NodeWrapper';
import { NodeTextInput, NodeOutputRow } from './components';

const StringConcatNode: React.FC<XYNodeProps> = ({ data, id }) => {
  const nodeData = data as unknown as StringConcatNodeData;
  const [separator, setSeparator] = useState<string>(nodeData?.separator || '_');
  const [input1, setInput1] = useState<string>(nodeData?.input_1 || '');
  const [input2, setInput2] = useState<string>(nodeData?.input_2 || '');
  const edges = useEdges();
  
  // Update node data when separator changes
  const handleSeparatorChange = useCallback((newSeparator: string) => {
    setSeparator(newSeparator);
    if (nodeData) {
      nodeData.separator = newSeparator;
    }
  }, [nodeData]);

  // Update input 1 value
  const handleInput1Change = useCallback((value: string) => {
    setInput1(value);
    if (nodeData) {
      nodeData.input_1 = value;
    }
  }, [nodeData]);

  // Update input 2 value
  const handleInput2Change = useCallback((value: string) => {
    setInput2(value);
    if (nodeData) {
      nodeData.input_2 = value;
    }
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
      theme="transformation"
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
        value={input1}
        onChange={handleInput1Change}
        hasInput={true}
        inputHandleId="input-1"
        nodeType="stringConcat"
        isConnected={isInput1Connected}
        className="mb-2"
      />
      
      {/* Input 2 */}
      <NodeTextInput
        label="Input 2"
        value={input2}
        onChange={handleInput2Change}
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