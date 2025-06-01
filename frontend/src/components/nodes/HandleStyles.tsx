"use client";

import React from 'react';
import { Handle, Position } from '@xyflow/react';

type StyledHandleProps = {
  type: 'source' | 'target';
  position: Position;
  id: string;
  nodeType: 'input' | 'output' | 'transformation' | 'utility';
  isConnected?: boolean;
  isConnectable?: boolean;
  style?: React.CSSProperties;
};

const StyledHandle: React.FC<StyledHandleProps> = ({
  type,
  position,
  id,
  nodeType,
  isConnected = false,
  isConnectable = true,
  style = {},
}) => {
  const getHandleColor = (nodeType: string) => {
    switch (nodeType) {
      case 'input':
        return 'var(--color-primary)';
      case 'transformation':
        return '#8b5cf6';
      case 'output':
        return 'var(--color-success)';
      case 'utility':
      default:
        return 'var(--color-secondary)';
    }
  };

  const baseStyle: React.CSSProperties = {
    width: '12px',
    height: '12px',
    background: isConnected ? getHandleColor(nodeType) : 'white',
    border: `2px solid ${getHandleColor(nodeType)}`,
    borderRadius: '50%',
    zIndex: 'var(--z-handle)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ...style,
  };

  return (
    <Handle
      type={type}
      position={position}
      id={id}
      isConnectable={isConnectable}
      style={baseStyle}
      className={`react-flow__handle ${isConnected ? 'connected' : ''}`}
    />
  );
};

// Legacy color mapping for backward compatibility
export const handleColors = {
  input: 'var(--color-primary)',
  output: 'var(--color-success)',
  stringConcat: '#8b5cf6',
};

export default StyledHandle; 