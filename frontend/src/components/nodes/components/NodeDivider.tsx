"use client";

import React from "react";
import NodeRow from "./NodeRow";

interface InputNodeRowProps {
  className?: string;
}

const InputNodeRow: React.FC<InputNodeRowProps> = ({ className = "" }) => {
  return (
    <NodeRow className={`${className}`}>
      <hr className="node-divider" />
    </NodeRow>
  );
};

export default InputNodeRow;
