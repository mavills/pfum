"use client";

import React, { ReactNode } from 'react';

type NodeTheme = 'input' | 'transformation' | 'output' | 'utility';

type NodeWrapperProps = {
  children: ReactNode;
  title: string;
  theme?: NodeTheme;
  headerColor?: string; // Legacy support
  width?: string;
};

const NodeWrapper: React.FC<NodeWrapperProps> = ({
  children,
  title,
  theme = 'utility',
  headerColor, // Legacy support
  width = 'auto',
}) => {
  // Get theme class, with fallback to legacy headerColor
  const getThemeClass = () => {
    if (headerColor) {
      return ''; // Use inline style for legacy support
    }
    return `theme-${theme}`;
  };

  const headerStyle = headerColor ? { backgroundColor: headerColor } : {};

  return (
    <div className="react-flow__node-content" style={{ width }}>
      {/* Header with theme or legacy color */}
      <div 
        className={`node-header ${getThemeClass()}`}
        style={headerStyle}
      >
        <span className="truncate">{title}</span>
      </div>
      
      {/* Content area */}
      <div className="node-body">
        {children}
      </div>
    </div>
  );
};

export default NodeWrapper; 