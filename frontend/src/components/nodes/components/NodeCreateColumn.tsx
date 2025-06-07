"use client";

import React from "react";
import NodeRow from "./NodeRow";
import { Plus } from "lucide-react";

interface InputNodeRowProps {
  inputValue: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  className?: string;
  placeholder?: string;
}

const InputNodeRow: React.FC<InputNodeRowProps> = ({
  inputValue,
  onChange,
  onSubmit,
  placeholder,
  className = "",
}) => {
  return (
    <NodeRow className={`${className}`}>
      <div className="node-row__input-outer">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="node-row__form-input"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSubmit();
            }
          }}
        />
        {/* <NodeButton label="Add" onClick={onSubmit} primary /> */}
        <button
          className="btn-default"
          onClick={onSubmit}
          title="Add column"
        >
          <Plus />
        </button>
      </div>
    </NodeRow>
  );
};

export default InputNodeRow;
