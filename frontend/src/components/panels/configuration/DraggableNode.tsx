import React from "react";
import {
  Calculator,
  Calendar,
  GripVertical,
  Sparkles,
  Table,
  Text,
  User,
} from "lucide-react";
import nodePubSub from "@/services/nodes/pubsub";
import { Operator } from "@/services/templating/operatorType";

interface DraggableNodeProps {
  operator: Operator;
}
const OperationTypeToIcon = (type: string | undefined) => {
  // []: <FileInput size={14} />,
  // []: <Sparkles size={14} />,
  const icons = {
    calendar: <Calendar size={14} />,
    table: <Table size={14} />,
    string: <Text size={14} />,
    user: <User size={14} />,
    math: <Calculator size={14} />,
  };
  if (type && type in icons) {
    return icons[type as keyof typeof icons];
  }
  return null;
};

const DraggableNode: React.FC<DraggableNodeProps> = ({ operator }) => {
  const handleDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify(operator)
    );
    event.dataTransfer.effectAllowed = "copy";
  };

  const handleClick = () => {
    const defaultPosition = { x: 250, y: 250 };
    nodePubSub.addNodeFromOperator(operator, defaultPosition);
  };

  return (
    <div
      draggable={true}
      onDragStart={handleDragStart}
      onClick={handleClick}
      className="config-draggable__item"
      title={`Drag to canvas or click to add\n${operator.description}`}
    >
      <div className="config-draggable__drag-handle">
        <GripVertical size={16} />
      </div>

      <div className="config-draggable__icon">
        {OperationTypeToIcon(operator.icon) ?? (
          <div className="config-draggable__icon-default">
            <Sparkles size={14} />
            {operator.icon}
          </div>
        )}
      </div>

      <div className="config-draggable__content">
        <div className="config-draggable__title">{operator.title}</div>
        <div className="config-draggable__description">
          {operator.description}
        </div>
      </div>
    </div>
  );
};

export default DraggableNode;
