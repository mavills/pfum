"use client";

import React from 'react';
import { Position } from '@xyflow/react';
import StyledHandle, { handleColors } from '../HandleStyles';

interface NodeOutputRowProps {
  label: string;
  outputHandleId: string;
  nodeType?: 'input' | 'output' | 'stringConcat';
  outputPosition?: Position;
  className?: string;
}

const NodeOutputRow: React.FC<NodeOutputRowProps> = ({
  label,
  outputHandleId,
  nodeType = 'stringConcat',
  outputPosition = Position.Right,
  className = '',
}) => {
  // Map nodeType to handle color
  const handleColor = handleColors[nodeType] || handleColors.stringConcat;
  
  return (
    <div className={`node-content-row relative ${className}`}>
      <div className="flex justify-end w-full">
        <span className="text-sm">{label}</span>
      </div>
      
      {/* Output handle */}
      <StyledHandle
        type="source"
        position={outputPosition}
        id={outputHandleId}
        color={handleColor}
      />
    </div>
  );
};

export default NodeOutputRow; 