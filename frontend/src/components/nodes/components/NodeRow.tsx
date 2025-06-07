"use client";

import React from "react";
import { Position } from "@xyflow/react";
import StyledHandle from "../HandleStyles";

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
        <StyledHandle
          type="target"
          position={Position.Left}
          id={inputHandleId}
          dataType={inputDataType}
        />
      )}
      {outputHandleId && (
        <StyledHandle
          type="source"
          position={Position.Right}
          id={outputHandleId}
          dataType={outputDataType}
        />
      )}
    </div>
  );
};

export default NodeRow;
