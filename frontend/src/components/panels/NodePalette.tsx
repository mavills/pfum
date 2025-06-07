"use client";

import React, { useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import {
  ChevronDown,
  FileInput,
  Sparkles,
} from "lucide-react";
import { NodeType } from "../../types";
import { nodeConfigService } from "../../services/nodeConfigService";
import DraggableNode from "./configuration/DraggableNode";

interface NodePaletteProps {
  onAddNode: (type: NodeType, position: { x: number; y: number }) => void;
  onAddDynamicNode: (
    configId: string,
    position: { x: number; y: number }
  ) => void;
}

const NodePalette: React.FC<NodePaletteProps> = ({
  onAddNode,
  onAddDynamicNode,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Get available dynamic node configurations
  const dynamicConfigs = nodeConfigService.getAllConfigurations();

  // Group dynamic configurations by category
  const dynamicCategories = dynamicConfigs.reduce((acc, { id, config }) => {
    const category = config.category || "Custom Nodes";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ id, config });
    return acc;
  }, {} as Record<string, Array<{ id: string; config: { name: string; description?: string; category?: string } }>>);

  // Basic node definitions
  const basicNodes = [
    {
      type: "basic" as const,
      nodeType: NodeType.INPUT,
      title: "Input Node",
      description: "Define CSV column structure",
      icon: <FileInput size={16} />,
    },
  ];

  if (isCollapsed) {
    return (
      <div className="bg-white border-b border-gray-200">
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-blue-500" />
            <span className="font-medium text-gray-900">Add Nodes</span>
          </div>
          <ChevronDown
            size={16}
            className="text-gray-400 transform rotate-180"
          />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Section Header */}
      <div className="border-b border-gray-100">
        <button
          onClick={() => setIsCollapsed(true)}
          className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-blue-500" />
            <span className="font-medium text-gray-900">Add Nodes</span>
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </button>
      </div>

      {/* Accordion Content */}
      <div className="p-2">
        <Accordion.Root type="multiple" className="space-y-1">
          {/* Basic Nodes Section */}
          <Accordion.Item
            value="basic-nodes"
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <Accordion.Trigger className="w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between text-sm font-medium text-gray-900">
              <span>Basic Nodes</span>
              <ChevronDown
                size={14}
                className="text-gray-400 transition-transform group-data-[state=open]:rotate-180"
              />
            </Accordion.Trigger>
            <Accordion.Content className="p-2 pt-0 space-y-2">
              {basicNodes.map((node) => (
                <DraggableNode
                  key={`basic-${node.nodeType}`}
                  type={node.type}
                  nodeType={node.nodeType}
                  title={node.title}
                  description={node.description}
                  icon={node.icon}
                  onAddNode={onAddNode}
                  onAddDynamicNode={onAddDynamicNode}
                />
              ))}
            </Accordion.Content>
          </Accordion.Item>

          {/* Dynamic Node Categories */}
          {Object.entries(dynamicCategories).map(([categoryName, configs]) => (
            <Accordion.Item
              key={categoryName}
              value={`dynamic-${categoryName}`}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <Accordion.Trigger className="w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between text-sm font-medium text-gray-900">
                <span>{categoryName}</span>
                <ChevronDown
                  size={14}
                  className="text-gray-400 transition-transform group-data-[state=open]:rotate-180"
                />
              </Accordion.Trigger>
              <Accordion.Content className="p-2 pt-0 space-y-2">
                {configs.map(({ id, config }) => (
                  <DraggableNode
                    key={id}
                    type="dynamic"
                    configId={id}
                    title={config.name}
                    description={
                      config.description || "Custom node configuration"
                    }
                    icon={<Sparkles size={16} />}
                    onAddNode={onAddNode}
                    onAddDynamicNode={onAddDynamicNode}
                  />
                ))}
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </div>
  );
};

export default NodePalette;
