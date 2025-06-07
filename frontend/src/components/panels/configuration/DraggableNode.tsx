import React from "react";
import { GripVertical } from "lucide-react";
import { NodeType } from "../../../types";

interface DraggableNodeProps {
  type: "basic" | "dynamic";
  nodeType?: NodeType;
  configId?: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onAddNode: (type: NodeType, position: { x: number; y: number }) => void;
  onAddDynamicNode: (
    configId: string,
    position: { x: number; y: number }
  ) => void;
}

const DraggableNode: React.FC<DraggableNodeProps> = ({
  type,
  nodeType,
  configId,
  title,
  description,
  icon,
  onAddNode,
  onAddDynamicNode,
}) => {
  const handleDragStart = (event: React.DragEvent) => {
    const nodeData = {
      type,
      nodeType,
      configId,
      title,
    };

    // Set the data in multiple formats to ensure compatibility
    const dataString = JSON.stringify(nodeData);
    event.dataTransfer.setData("application/reactflow", dataString);
    event.dataTransfer.setData("text/plain", dataString);

    // Set the effect to copy
    event.dataTransfer.effectAllowed = "copy";
  };

  const handleClick = () => {
    const defaultPosition = { x: 250, y: 250 };

    if (type === "basic" && nodeType) {
      onAddNode(nodeType, defaultPosition);
    } else if (type === "dynamic" && configId) {
      onAddDynamicNode(configId, defaultPosition);
    }
  };

  return (
    <div
      draggable={true}
      onDragStart={handleDragStart}
      onClick={handleClick}
      className="config-draggable__item"
      title={`Drag to canvas or click to add\n${description}`}
    >
      <div className="config-draggable__drag-handle">
        <GripVertical size={16} />
      </div>

      <div className="config-draggable__icon">{icon}</div>

      <div className="config-draggable__content">
        <div className="config-draggable__title">{title}</div>
        <div className="config-draggable__description">{description}</div>
      </div>
    </div>
  );
};

export default DraggableNode;
