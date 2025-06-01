"use client";

import React from 'react';
import { Position } from '@xyflow/react';
import StyledHandle from '../HandleStyles';

interface NodeOutputRowProps {
  label: string;
  outputHandleId: string;
  nodeType?: 'input' | 'output' | 'stringConcat' | 'transformation' | 'utility';
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
      <div className="flex justify-end w-full">
        <span className="text-sm">{label}</span>
      </div>
      
      {/* Output handle */}
      <StyledHandle
        type="source"
        position={outputPosition}
        id={outputHandleId}
        nodeType={getNodeTheme(nodeType)}
      />
    </div>
  );
};

export default NodeOutputRow; 