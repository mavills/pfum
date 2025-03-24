"use client";

import React from 'react';
import { Handle, Position } from '@xyflow/react';

type StyledHandleProps = {
  type: 'source' | 'target';
  position: Position;
  id: string;
  color: string;
  isConnected?: boolean;
  isConnectable?: boolean;
  style?: React.CSSProperties;
};

const StyledHandle: React.FC<StyledHandleProps> = ({
  type,
  position,
  id,
  color,
  isConnected = false,
  isConnectable = true,
  style = {},
}) => {
  const baseStyle: React.CSSProperties = {
    width: '14px',
    height: '14px',
    background: color,
    border: '2px solid rgba(255,255,255,0.9)',
    zIndex: 10,
    cursor: 'pointer',
    ...style,
  };

  if (isConnected) {
    baseStyle.borderColor = 'white';
  }

  return (
    <Handle
      type={type}
      position={position}
      id={id}
      isConnectable={isConnectable}
      style={baseStyle}
      className={`${isConnected ? 'connected-handle' : ''}`}
    />
  );
};

// Predefined colors for different node types
export const handleColors = {
  input: '#E74C3C', // Red
  output: '#27AE60', // Green
  stringConcat: '#9B59B6', // Purple
};

export default StyledHandle; 