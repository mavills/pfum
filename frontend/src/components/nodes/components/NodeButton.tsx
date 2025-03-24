"use client";

import React from 'react';

interface NodeButtonProps {
  label: string;
  onClick: () => void;
  primary?: boolean;
  danger?: boolean;
  small?: boolean;
  className?: string;
}

const NodeButton: React.FC<NodeButtonProps> = ({
  label,
  onClick,
  primary = false,
  danger = false,
  small = false,
  className = '',
}) => {
  const baseStyle = "rounded focus:outline-none transition-colors";
  const sizeStyle = small ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm";
  
  let colorStyle = "bg-gray-100 text-gray-700 hover:bg-gray-200"; // default
  
  if (primary) {
    colorStyle = "bg-blue-500 text-white hover:bg-blue-600";
  } else if (danger) {
    colorStyle = "bg-red-500 text-white hover:bg-red-600";
  }
  
  return (
    <button
      className={`node-button`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
};

export default NodeButton; 