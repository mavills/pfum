"use client";

import React from 'react';
import { Position } from '@xyflow/react';
import StyledHandle from '../HandleStyles';

interface NodeOutputRowProps {
  label: string;
  outputHandleId: string;
  outputDataType?: string; // Data type for output handle
  outputPosition?: Position;
  className?: string;
}

const NodeOutputRow: React.FC<NodeOutputRowProps> = ({
  label,
  outputHandleId,
  outputDataType,
  outputPosition = Position.Right,
  className = '',
}) => {
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
        dataType={outputDataType}
      />
    </div>
  );
};

export default NodeOutputRow; 