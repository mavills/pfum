"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";

type StyledHandleProps = {
  type: "source" | "target";
  position: Position;
  id: string;
  dataType?: string; // The actual data type (string, number, datetime, etc.)
  isConnected?: boolean;
  isConnectable?: boolean;
  style?: React.CSSProperties;
};

// Generate a consistent color from a type string
function generateTypeColor(type?: string): string {
  if (!type || type === "unknown") {
    return "#6b7280"; // Gray for unknown/no type
  }

  // Simple hash function to generate consistent colors from strings
  let hash = 0;
  for (let i = 0; i < type.length; i++) {
    const char = type.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Generate HSL color with good saturation and lightness
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

const StyledHandle: React.FC<StyledHandleProps> = ({
  type,
  position,
  id,
  dataType,
  isConnected = false,
  isConnectable = true,
  style = {},
}) => {
  const typeColor = generateTypeColor(dataType);

  // Position handles at the actual edges of nodes (slightly outside the boundaries)
  const getPositionStyle = (position: Position) => {
    const size = 12;
    const offset = size / 2;

    switch (position) {
      case Position.Left:
        return {
          // left: -offset - 2, // Move outside the node boundary
          // top: '50%',
          // marginTop: -offset // Center vertically without transform
        };
      case Position.Right:
        return {
          // right: -offset - 2, // Move outside the node boundary
          // top: '50%',
          // marginTop: -offset // Center vertically without transform
        };
      case Position.Top:
        return {
          // top: -offset - 2, // Move outside the node boundary
          // left: '50%',
          // marginLeft: -offset // Center horizontally without transform
        };
      case Position.Bottom:
        return {
          // bottom: -offset - 2, // Move outside the node boundary
          // left: '50%',
          // marginLeft: -offset // Center horizontally without transform
        };
      default:
        return {};
    }
  };

  const baseStyle: React.CSSProperties = {
    width: "12px",
    height: "12px",
    background: isConnected ? typeColor : "white",
    border: `2px solid ${typeColor}`,
    borderRadius: "50%",
    zIndex: "var(--z-handle)",
    cursor: "pointer",
    position: "absolute",
    // Remove any transitions to prevent animations
    transition: "none",
    transform: "none", // Explicitly prevent any transforms
    ...getPositionStyle(position),
    ...style,
  };

  return (
    <Handle
      type={type}
      position={position}
      id={id}
      isConnectable={isConnectable}
      // style={baseStyle}
      // className={`custom-handle ${isConnected ? "connected" : ""}`}
      data-type={dataType} // Store type for connection validation
    />
  );
};

// Helper function to get the data type from handle ID for connection validation
export function getHandleType(handleId: string | null): string | null {
  if (!handleId) return null;

  // Extract type information from handle ID if needed
  // For now, we'll rely on the data-type attribute
  return null;
}

// Helper function to check if two types are compatible
export function areTypesCompatible(
  sourceType?: string,
  targetType?: string
): boolean {
  // No type or unknown types can connect to anything
  if (
    !sourceType ||
    !targetType ||
    sourceType === "unknown" ||
    targetType === "unknown"
  ) {
    return true;
  }

  // Same types can connect
  if (sourceType === targetType) {
    return true;
  }

  // Define compatible type pairs if needed
  const compatibleTypes: Record<string, string[]> = {
    string: ["text", "varchar"],
    number: ["integer", "float", "decimal"],
    datetime: ["date", "timestamp"],
  };

  // Check if types are in the same compatibility group
  for (const [baseType, compatibles] of Object.entries(compatibleTypes)) {
    if (
      (sourceType === baseType || compatibles.includes(sourceType)) &&
      (targetType === baseType || compatibles.includes(targetType))
    ) {
      return true;
    }
  }

  return false;
}

export default StyledHandle;
