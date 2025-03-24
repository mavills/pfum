"use client";

import React from 'react';
import { Position } from '@xyflow/react';
import StyledHandle, { handleColors } from '../HandleStyles';

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
  nodeType?: 'input' | 'output' | 'stringConcat'; // to determine handle color
  isConnected?: boolean; // to determine if the input is connected
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
  nodeType = 'output',
  isConnected = false,
  inputPosition = Position.Left,
  outputPosition = Position.Right,
  className = '',
}) => {
  // Map nodeType to handle color
  const handleColor = handleColors[nodeType] || handleColors.output;
  
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
      
      {/* Hide the dropdown if connected */}
      {(!isConnected || !hasInput) && (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-grow ml-2 p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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

export default NodeDropdown; 