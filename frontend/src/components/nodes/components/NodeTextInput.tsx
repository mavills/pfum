"use client";

import React, { useState, useEffect } from 'react';
import { Position } from '@xyflow/react';
import StyledHandle, { handleColors } from '../HandleStyles';

interface NodeTextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hasInput?: boolean;
  hasOutput?: boolean;
  inputHandleId?: string;
  outputHandleId?: string;
  nodeType?: 'input' | 'output' | 'stringConcat'; // to determine handle color
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
  nodeType = 'stringConcat',
  isConnected = false,
  inputPosition = Position.Left,
  outputPosition = Position.Right,
  className = '',
}) => {
  // Map nodeType to handle color
  const handleColor = handleColors[nodeType] || handleColors.stringConcat;
  
  return (
    <div className={`node-content-row relative ${className}`}>
      {/* Optional input handle */}
      {hasInput && (
        <StyledHandle
          type="target"
          position={inputPosition}
          id={inputHandleId}
          color={handleColor}
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
          className="flex-grow ml-2 p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1"
        />
      )}
      
      {/* Optional output handle */}
      {hasOutput && (
        <StyledHandle
          type="source"
          position={outputPosition}
          id={outputHandleId}
          color={handleColor}
        />
      )}
    </div>
  );
};

export default NodeTextInput; 