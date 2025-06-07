"use client";

import React from "react";
import { Position } from "@xyflow/react";
import NodeRow from "./NodeRow";

interface NodeTextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isEditable?: boolean;
  hasOutput?: boolean;
  inputHandleId?: string;
  inputDataType?: string; // Data type for input handle
  isConnected?: boolean; // to determine if the input is connected
  inputPosition?: Position;
  className?: string;
}

const NodeTextInput: React.FC<NodeTextInputProps> = ({
  label,
  value,
  onChange,
  placeholder = "",
  isEditable = true,
  inputHandleId = "input",
  inputDataType,
  isConnected = false,
  className = "",
}) => {
  return (
    <NodeRow
      className={className}
      inputHandleId={inputHandleId}
      inputDataType={inputDataType}
    >
      <div className="node-row__input-outer">
        <span className="">{label}</span>

        {/* Hide the input if connected */}
        {!isConnected && isEditable && (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="node-row__form-input flex-1"
          />
        )}
      </div>
    </NodeRow>
  );
};

export default NodeTextInput;
