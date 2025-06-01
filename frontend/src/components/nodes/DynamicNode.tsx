"use client";

import React, { useState, useCallback } from 'react';
import { NodeProps, useEdges, Edge } from '@xyflow/react';
import { DynamicNodeData, getInputHandleId, getOutputHandleId } from '../../types/nodeConfig';
import NodeWrapper from './NodeWrapper';
import { NodeTextInput, NodeOutputRow } from './components';

const DynamicNode: React.FC<NodeProps> = ({ data, id }) => {
  const nodeData = data as unknown as DynamicNodeData;
  const edges = useEdges();
  
  // State for input values
  const [inputValues, setInputValues] = useState<Record<string, string | number | boolean>>(
    nodeData?.inputValues || {}
  );

  // Handle input value changes
  const handleInputChange = useCallback((inputName: string, value: string | number | boolean) => {
    setInputValues(prev => {
      const newValues = { ...prev, [inputName]: value };
      
      // Update the node data
      if (nodeData) {
        nodeData.inputValues = newValues;
      }
      
      return newValues;
    });
  }, [nodeData]);

  // Check if an input is connected
  const isInputConnected = useCallback((inputName: string) => {
    const handleId = getInputHandleId(inputName);
    return edges.some((edge: Edge) => edge.target === id && edge.targetHandle === handleId);
  }, [edges, id]);

  // Get the current value for an input (from connection or user input or default)
  const getInputValue = useCallback((inputName: string) => {
    // If connected, don't show user input
    if (isInputConnected(inputName)) {
      return '';
    }
    
    // Use user-entered value or default
    const userValue = inputValues[inputName];
    if (userValue !== undefined && userValue !== '') {
      return String(userValue);
    }
    
    // Use default value from config
    const inputConfig = nodeData.config.inputs.find(input => input.name === inputName);
    return inputConfig?.default ? String(inputConfig.default) : '';
  }, [inputValues, isInputConnected, nodeData]);

  if (!nodeData || !nodeData.config) {
    return (
      <NodeWrapper title="Error" theme="utility">
        <div className="text-red-500 text-sm">Invalid node configuration</div>
      </NodeWrapper>
    );
  }

  const { config } = nodeData;

  return (
    <NodeWrapper
      title={config.name}
      theme="transformation" // You could make this configurable based on category
    >
      {/* Description */}
      {config.description && (
        <div className="text-sm mb-3 text-gray-600">{config.description}</div>
      )}
      
      {/* Inputs */}
      {config.inputs.length > 0 && (
        <div className="mb-4">
          <div className="node-field-label">Inputs:</div>
          <div className="space-y-2">
            {config.inputs.map((input) => (
              <NodeTextInput
                key={`${id}-input-${input.name}`}
                label={input.name}
                value={getInputValue(input.name)}
                onChange={(value) => handleInputChange(input.name, value)}
                placeholder={input.description}
                hasInput={true}
                inputHandleId={getInputHandleId(input.name)}
                inputDataType={input.type}
                isConnected={isInputConnected(input.name)}
                className="mb-2"
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Outputs */}
      {config.outputs.length > 0 && (
        <div className="mb-2">
          <div className="node-field-label">Outputs:</div>
          <div className="space-y-2">
            {config.outputs.map((output) => (
              <NodeOutputRow
                key={`${id}-output-${output.name}`}
                label={output.name}
                outputHandleId={getOutputHandleId(output.name)}
                outputDataType={output.type}
              />
            ))}
          </div>
        </div>
      )}

      {/* Debug info (optional, can be hidden in production) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4">
          <summary className="text-xs text-gray-400 cursor-pointer">Debug Info</summary>
          <div className="text-xs text-gray-400 mt-2">
            <div>Config ID: {nodeData.nodeConfigId}</div>
            <div>Category: {config.category || 'Uncategorized'}</div>
            <div>Operations: {config.operations.length}</div>
          </div>
        </details>
      )}
    </NodeWrapper>
  );
};

export default DynamicNode; 