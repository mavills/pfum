"use client";

import React from "react";

interface NodeRowProps {
  children: React.ReactNode;
  label: string;
  className?: string;
}

const NodeRowGroup: React.FC<NodeRowProps> = ({
  children,
  label,
  className = "",
}) => {
  return (
    <div className={`node-content-group ${className}`}>
      <div className="node-content-group-label">{label}</div>
      <div className="node-content-group-children">{children}</div>
    </div>
  );
};

export default NodeRowGroup;
