"use client";

import React from 'react';
import { NodeType } from '../../types';
import { nodeConfigService } from '../../services/nodeConfigService';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAddNode: (nodeType: NodeType, position: { x: number; y: number }) => void;
  onAddDynamicNode?: (configId: string, position: { x: number; y: number }) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ 
  x, 
  y, 
  onClose, 
  onAddNode, 
  onAddDynamicNode 
}) => {
  // Get available dynamic node configurations
  const dynamicConfigs = nodeConfigService.getAllConfigurations();
  
  const nodeCategories = [
    {
      title: 'Basic Nodes',
      items: [
        { type: NodeType.INPUT, label: 'Input Node' },
        { type: NodeType.OUTPUT, label: 'Output Node' },
        { type: NodeType.STRING_CONCAT, label: 'String Concatenation' },
      ],
    },
  ];

  // Group dynamic configurations by category
  const dynamicCategories = dynamicConfigs.reduce((acc, { id, config }) => {
    const category = config.category || 'Custom Nodes';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ id, config });
    return acc;
  }, {} as Record<string, Array<{ id: string; config: any }>>);
  
  // Close the menu when clicking outside of it
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.context-menu')) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleAddNode = (nodeType: NodeType) => {
    onAddNode(nodeType, { x, y });
    onClose();
  };

  const handleAddDynamicNode = (configId: string) => {
    if (onAddDynamicNode) {
      onAddDynamicNode(configId, { x, y });
      onClose();
    }
  };

  return (
    <div 
      className="context-menu absolute bg-white shadow-lg rounded-md overflow-hidden border border-gray-200 max-h-96 overflow-y-auto"
      style={{ left: x, top: y }}
    >
      {/* Basic/Legacy Nodes */}
      {nodeCategories.map((category, catIndex) => (
        <div key={catIndex}>
          <div className="px-4 py-2 bg-gray-100 font-medium text-sm">
            {category.title}
          </div>
          <div>
            {category.items.map((item, itemIndex) => (
              <div 
                key={itemIndex}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                onClick={() => handleAddNode(item.type)}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Dynamic Nodes */}
      {Object.entries(dynamicCategories).map(([categoryName, configs]) => (
        <div key={categoryName}>
          <div className="px-4 py-2 bg-purple-100 font-medium text-sm">
            {categoryName}
          </div>
          <div>
            {configs.map(({ id, config }) => (
              <div 
                key={id}
                className="px-4 py-2 hover:bg-purple-50 cursor-pointer text-sm"
                onClick={() => handleAddDynamicNode(id)}
                title={config.description}
              >
                <div className="font-medium">{config.name}</div>
                {config.description && (
                  <div className="text-xs text-gray-500 truncate">
                    {config.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Show message if no dynamic nodes are available */}
      {Object.keys(dynamicCategories).length === 0 && (
        <div className="px-4 py-2 text-sm text-gray-500 italic">
          No custom node configurations available
        </div>
      )}
    </div>
  );
};

export default ContextMenu; 