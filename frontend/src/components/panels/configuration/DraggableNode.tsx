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
    console.log("🚀 [DRAG-START] Starting drag for:", title);

    const nodeData = {
      type,
      nodeType,
      configId,
      title,
    };

    console.log("📦 [DRAG-DATA] Node data:", nodeData);

    // Set the data in multiple formats to ensure compatibility
    const dataString = JSON.stringify(nodeData);
    event.dataTransfer.setData("application/reactflow", dataString);
    event.dataTransfer.setData("text/plain", dataString);

    // Set the effect to copy
    event.dataTransfer.effectAllowed = "copy";

    // Create a cleaner drag image
    const dragImage = document.createElement("div");
    dragImage.innerHTML = title;
    dragImage.style.position = "absolute";
    dragImage.style.top = "-1000px";
    dragImage.style.left = "-1000px";
    dragImage.style.background = "#4a5568";
    dragImage.style.color = "white";
    dragImage.style.padding = "6px 10px";
    dragImage.style.borderRadius = "4px";
    dragImage.style.fontSize = "12px";
    dragImage.style.fontWeight = "500";
    dragImage.style.pointerEvents = "none";
    dragImage.style.zIndex = "-1";

    document.body.appendChild(dragImage);

    try {
      event.dataTransfer.setDragImage(dragImage, 50, 15);
      console.log("🖼️ [DRAG-IMAGE] Custom drag image set");
    } catch (error) {
      console.warn("⚠️ [DRAG-IMAGE] Failed to set custom drag image:", error);
    }

    // Clean up the drag image after a short delay
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
        console.log("🧹 [CLEANUP] Drag image removed");
      }
    }, 100);
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
      className="config-node-item"
      title={`Drag to canvas or click to add\n${description}`}
    >
      <div className="config-node-drag-handle">
        <GripVertical size={12} />
      </div>

      <div className="config-node-icon">{icon}</div>

      <div className="config-node-content">
        <div className="config-node-title">{title}</div>
        <div className="config-node-description">{description}</div>
      </div>
    </div>
  );
};

export default DraggableNode;
