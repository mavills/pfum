"use client";

import React, { useState } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown, GripVertical, FileInput, FileOutput, Type, Sparkles } from 'lucide-react';
import { NodeType } from '../../types';
import { nodeConfigService } from '../../services/nodeConfigService';

interface NodePaletteProps {
  onAddNode: (type: NodeType, position: { x: number; y: number }) => void;
  onAddDynamicNode: (configId: string, position: { x: number; y: number }) => void;
}

interface DraggableNodeProps {
  type: 'basic' | 'dynamic';
  nodeType?: NodeType;
  configId?: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onAddNode: (type: NodeType, position: { x: number; y: number }) => void;
  onAddDynamicNode: (configId: string, position: { x: number; y: number }) => void;
}

const DraggableNode: React.FC<DraggableNodeProps> = ({
  type,
  nodeType,
  configId,
  title,
  description,
  icon,
  onAddNode,
  onAddDynamicNode
}) => {
  const handleDragStart = (event: React.DragEvent) => {
    // Store the node data for the drop handler
    const nodeData = {
      type,
      nodeType,
      configId,
      title
    };
    
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'copy';
    
    // Create a drag image
    const dragImage = document.createElement('div');
    dragImage.innerHTML = title;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.background = 'white';
    dragImage.style.padding = '8px 12px';
    dragImage.style.borderRadius = '6px';
    dragImage.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    dragImage.style.border = '1px solid #e5e7eb';
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, 0, 0);
    
    // Clean up the drag image after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  const handleClick = () => {
    // Default position for click-to-add (center of viewport)
    const defaultPosition = { x: 250, y: 250 };
    
    if (type === 'basic' && nodeType) {
      onAddNode(nodeType, defaultPosition);
    } else if (type === 'dynamic' && configId) {
      onAddDynamicNode(configId, defaultPosition);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      className="group flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md"
      title={`Drag to canvas or click to add at center\n${description}`}
    >
      <div className="flex-shrink-0 text-gray-400 group-hover:text-gray-600">
        <GripVertical size={16} />
      </div>
      
      <div className="flex-shrink-0 text-gray-500 group-hover:text-gray-700">
        {icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900 truncate">
          {title}
        </div>
        <div className="text-xs text-gray-500 truncate">
          {description}
        </div>
      </div>
    </div>
  );
};

const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode, onAddDynamicNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Get available dynamic node configurations
  const dynamicConfigs = nodeConfigService.getAllConfigurations();
  
  // Group dynamic configurations by category
  const dynamicCategories = dynamicConfigs.reduce((acc, { id, config }) => {
    const category = config.category || 'Custom Nodes';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ id, config });
    return acc;
  }, {} as Record<string, Array<{ id: string; config: { name: string; description?: string; category?: string } }>>);

  // Basic node definitions
  const basicNodes = [
    {
      type: 'basic' as const,
      nodeType: NodeType.INPUT,
      title: 'Input Node',
      description: 'Define CSV column structure',
      icon: <FileInput size={16} />
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
          <ChevronDown size={16} className="text-gray-400 transform rotate-180" />
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
          <Accordion.Item value="basic-nodes" className="border border-gray-200 rounded-lg overflow-hidden">
            <Accordion.Trigger className="w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between text-sm font-medium text-gray-900">
              <span>Basic Nodes</span>
              <ChevronDown size={14} className="text-gray-400 transition-transform group-data-[state=open]:rotate-180" />
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
                <ChevronDown size={14} className="text-gray-400 transition-transform group-data-[state=open]:rotate-180" />
              </Accordion.Trigger>
              <Accordion.Content className="p-2 pt-0 space-y-2">
                {configs.map(({ id, config }) => (
                  <DraggableNode
                    key={id}
                    type="dynamic"
                    configId={id}
                    title={config.name}
                    description={config.description || 'Custom node configuration'}
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