"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";

interface NodeRowProps {
  children: React.ReactNode;
  inputHandleId?: string;
  inputDataType?: string;
  outputHandleId?: string;
  outputDataType?: string;
  className?: string;
}

const NodeRow: React.FC<NodeRowProps> = ({
  children,
  className = "",
  inputHandleId,
  inputDataType,
  outputHandleId,
  outputDataType,
}) => {
  return (
    <div className={`node-content-row-outer ${className}`}>
      <div className="node-content-row-inner">{children}</div>
      {inputHandleId && (
        <Handle
          type="target"
          position={Position.Left}
          id={inputHandleId}
          data-type={inputDataType}
        />
      )}
      {outputHandleId && (
        <Handle
          type="source"
          position={Position.Right}
          id={outputHandleId}
          data-type={outputDataType}
        />
      )}
    </div>
  );
};

export default NodeRow;
