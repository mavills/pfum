"use client";

import React, { ReactNode } from "react";

type NodeTheme = "input" | "transformation" | "output" | "utility";

type NodeWrapperProps = {
  children: ReactNode;
  title: string;
  headerColor?: string; // Legacy support
  width?: string;
};

const NodeWrapper: React.FC<NodeWrapperProps> = ({
  children,
  title,
  headerColor, // Legacy support
  width = "auto",
}) => {
  const headerStyle = headerColor ? { backgroundColor: headerColor } : {};

  return (
    <div className="node-content" style={{ width }}>
      {/* Header with theme or legacy color */}
      <div className="node-header" style={headerStyle}>
        <span className="truncate">{title}</span>
      </div>

      {/* Content area */}
      <div className="node-body">{children}</div>
    </div>
  );
};

export default NodeWrapper;
