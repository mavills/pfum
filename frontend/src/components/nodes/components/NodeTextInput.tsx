"use client";

import React from 'react';
import { Position } from '@xyflow/react';
import StyledHandle from '../HandleStyles';

interface NodeTextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hasInput?: boolean;
  hasOutput?: boolean;
  inputHandleId?: string;
  outputHandleId?: string;
  inputDataType?: string; // Data type for input handle
  outputDataType?: string; // Data type for output handle
  isConnected?: boolean; // to determine if the input is connected
  inputPosition?: Position;
  outputPosition?: Position;
  className?: string;
}

const NodeTextInput: React.FC<NodeTextInputProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  hasInput = false,
  hasOutput = false,
  inputHandleId = 'input',
  outputHandleId = 'output',
  inputDataType,
  outputDataType,
  isConnected = false,
  inputPosition = Position.Left,
  outputPosition = Position.Right,
  className = '',
}) => {
  return (
    <div className={`node-content-row relative ${className}`}>
      {/* Optional input handle */}
      {hasInput && (
        <StyledHandle
          type="target"
          position={inputPosition}
          id={inputHandleId}
          dataType={inputDataType}
          isConnected={isConnected}
        />
      )}
      
      <span className="text-sm">{label}</span>
      
      {/* Hide the input if connected */}
      {(!isConnected || !hasInput) && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="form-input flex-grow ml-2 p-1 text-sm"
        />
      )}
      
      {/* Optional output handle */}
      {hasOutput && (
        <StyledHandle
          type="source"
          position={outputPosition}
          id={outputHandleId}
          dataType={outputDataType}
        />
      )}
    </div>
  );
};

export default NodeTextInput; 