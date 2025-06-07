"use client";

import React from "react";
import NodeRow from "./NodeRow";
import { X } from "lucide-react";

interface InputNodeRowProps {
  label: string;
  onChange: (value: string) => void;
  onDelete: () => void;
  outputHandleId: string;
  outputDataType?: string;
  className?: string;
}

const InputNodeRow: React.FC<InputNodeRowProps> = ({
  label,
  onChange,
  onDelete,
  outputHandleId,
  outputDataType = "string",
  className = "",
}) => {
  return (
    <NodeRow
      outputHandleId={outputHandleId}
      outputDataType={outputDataType}
      className={`${className}`}
    >
      <div className="node-row__input-outer">
        <button
          onClick={onDelete}
          className="btn-destructive"
          title="Remove item"
        >
          <X />
        </button>
        <input
          type="text"
          value={label}
          onChange={(e) => onChange(e.target.value)}
          className="node-row__form-input"
        />
      </div>
    </NodeRow>
  );
};

export default InputNodeRow;
