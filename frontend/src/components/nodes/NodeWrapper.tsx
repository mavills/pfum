"use client";

import { Connection, useNodeConnections } from "@xyflow/react";
import React, { ReactNode } from "react";

type NodeWrapperProps = {
  children: ReactNode;
  title: string;
  headerColor?: string; // Legacy support
  width?: string;
  onConnectionChange?: (connection: Connection) => void;
};

const NodeWrapper: React.FC<NodeWrapperProps> = ({
  children,
  title,
  headerColor, // Legacy support
  width = "auto",
  onConnectionChange,
}) => {
  const connections = useNodeConnections({
    handleType: "target",
    onConnect: (connection) => {
      onConnectionChange?.(connection[0]);
    },
    onDisconnect: (connection) => {
      onConnectionChange?.(connection[0]);
    },
  });
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
