"use client";

import React from 'react';
import { Position } from '@xyflow/react';
import StyledHandle from '../HandleStyles';

interface InputNodeRowProps {
  id: string;
  index: number;
  label: string;
  onChange: (value: string) => void;
  onDelete: () => void;
  outputHandleId: string;
  className?: string;
}

const InputNodeRow: React.FC<InputNodeRowProps> = ({
  id,
  index,
  label,
  onChange,
  onDelete,
  outputHandleId,
  className = '',
}) => {
  return (
    <div className={`node-content-row relative ${className}`}>
      <div className="flex items-center justify-between w-full">
        {/* Delete button */}
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 text-xs mr-2 flex-shrink-0"
          title="Remove item"
        >
          ✕
        </button>
        
        {/* Input field */}
        <input 
          type="text"
          value={label}
          onChange={(e) => onChange(e.target.value)}
          className="form-input flex-grow p-1 text-sm"
        />
      </div>
      
      {/* Output handle */}
      <StyledHandle
        type="source"
        position={Position.Right}
        id={outputHandleId}
        nodeType="input"
      />
    </div>
  );
};

export default InputNodeRow; 