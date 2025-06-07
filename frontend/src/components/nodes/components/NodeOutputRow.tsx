"use client";

import React from "react";
import NodeRow from "./NodeRow";

interface NodeOutputRowProps {
  label: string;
  outputHandleId: string;
  outputDataType?: string; // Data type for output handle
  className?: string;
}

const NodeOutputRow: React.FC<NodeOutputRowProps> = ({
  label,
  outputHandleId,
  outputDataType,
  className = "",
}) => {
  return (
    <NodeRow
      outputHandleId={outputHandleId}
      outputDataType={outputDataType}
      className={`${className}`}
    >
      <div className="flex justify-end w-full">
        <span className="text-sm">{label}</span>
      </div>
    </NodeRow>
  );
};

export default NodeOutputRow;
