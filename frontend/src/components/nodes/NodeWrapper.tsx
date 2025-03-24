"use client";

import React, { ReactNode } from 'react';

type NodeWrapperProps = {
  children: ReactNode;
  title: string;
  headerColor: string;
  width?: string;
};

const NodeWrapper: React.FC<NodeWrapperProps> = ({
  children,
  title,
  headerColor,
  width = 'auto',
}) => {
  return (
    <>
      {/* Header with color */}
      <div 
        // className="py-2 px-3 m-2 text-white font-medium"
        className="node-header"
        style={{ backgroundColor: headerColor }}
      >
        {title}
      </div>
      
      {/* Content area with padding */}
      <div className="p-4">
        {children}
      </div>
    </>
  );
};

export default NodeWrapper; 