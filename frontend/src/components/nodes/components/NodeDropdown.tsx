"use client";

import React from 'react';
import { Position } from '@xyflow/react';
import StyledHandle from '../HandleStyles';

interface DropdownOption {
  value: string;
  label: string;
}

interface NodeDropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  hasInput?: boolean;
  hasOutput?: boolean;
  inputHandleId?: string;
  outputHandleId?: string;
  nodeType?: 'input' | 'output' | 'stringConcat';
  isConnected?: boolean;
  inputPosition?: Position;
  outputPosition?: Position;
  className?: string;
}

const NodeDropdown: React.FC<NodeDropdownProps> = ({
  label,
  value,
  options,
  onChange,
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
      
      <div className="flex flex-col w-full">
        <span className="text-sm mb-1">{label}</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="form-input p-1 text-sm"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
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

export default NodeDropdown; 