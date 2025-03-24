"use client";

import React from 'react';
import { NodeType } from '../../types';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAddNode: (nodeType: NodeType, position: { x: number; y: number }) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onAddNode }) => {
  const nodeCategories = [
    {
      title: 'Basic',
      items: [
        { type: NodeType.INPUT, label: 'Input Node' },
        { type: NodeType.OUTPUT, label: 'Output Node' },
        { type: NodeType.STRING_CONCAT, label: 'String Concatenation' },
      ],
    },
    // {
    //   title: 'String Operations',
    //   items: [
    //   ],
    // },
  ];
  
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

  return (
    <div 
      className="context-menu absolute bg-white shadow-lg rounded-md overflow-hidden border border-gray-200"
      style={{ left: x, top: y }}
    >
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
    </div>
  );
};

export default ContextMenu; 