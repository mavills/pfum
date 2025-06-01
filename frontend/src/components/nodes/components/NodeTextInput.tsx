"use client";

import React, { useState, useEffect } from 'react';
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
  nodeType?: 'input' | 'output' | 'stringConcat' | 'transformation' | 'utility'; // to determine handle color
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
  // Map nodeType to design system theme
  const getNodeTheme = (nodeType: string) => {
    switch (nodeType) {
      case 'input':
        return 'input';
      case 'output':
        return 'output';
      case 'stringConcat':
        return 'transformation';
      default:
        return 'utility';
    }
  };
  
  return (
    <div className={`node-content-row relative ${className}`}>
      {/* Optional input handle */}
      {hasInput && (
        <StyledHandle
          type="target"
          position={inputPosition}
          id={inputHandleId}
          nodeType={getNodeTheme(nodeType)}
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
          nodeType={getNodeTheme(nodeType)}
        />
      )}
    </div>
  );
};

export default NodeTextInput; 