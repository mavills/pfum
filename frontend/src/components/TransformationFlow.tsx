"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  ReactFlowProvider,
  ReactFlow,
  Background, 
  Controls, 
  Panel,
  Connection, 
  Node, 
  Edge, 
  NodeTypes,
  NodeChange, 
  EdgeChange, 
  applyNodeChanges, 
  applyEdgeChanges,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/base.css';

import InputNode from './nodes/InputNode';
import OutputNode from './nodes/OutputNode';
import StringConcatNode from './nodes/StringConcatNode';
import DynamicNode from './nodes/DynamicNode';
import PreviewPanel from './panels/PreviewPanel';
import ExportConfigPanel from './panels/ExportConfigPanel';
import S3ExplorerPanel from './panels/S3ExplorerPanel';
import NodePalette from './panels/NodePalette';
import { createNode, isValidConnection, createDynamicNode } from '../utils/nodeUtils';
import { NodeType, InputNodeData } from '../types';
import { initializeDefaultConfigurations } from '../services/nodeConfigService';

// Define node types mapping
const nodeTypes: NodeTypes = {
  [NodeType.INPUT]: InputNode,
  [NodeType.OUTPUT]: OutputNode,
  [NodeType.STRING_CONCAT]: StringConcatNode,
  [NodeType.DYNAMIC]: DynamicNode,
};

const FlowWithProvider: React.FC = () => {
  return (
    <ReactFlowProvider>
      <FlowContent />
    </ReactFlowProvider>
  );
};

const FlowContent: React.FC = () => {
  // State for nodes and edges
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  
  // State for selected elements
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  
  // Notification state
  const [showNotification, setShowNotification] = useState(true);
  
  // Panel states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  
  // S3 Explorer panel state
  const [isS3ExplorerOpen, setIsS3ExplorerOpen] = useState(true);

  // ReactFlow hooks
  const reactFlow = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  // Initialize node configurations on mount
  useEffect(() => {
    initializeDefaultConfigurations();
  }, []);

  // Hide notification after 5 seconds
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  // Handle node changes
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  // Handle edge changes
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      // Clear selected edge if it's being removed
      changes.forEach(change => {
        if (change.type === 'remove' && change.id === selectedEdge) {
          setSelectedEdge(null);
        }
      });
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [selectedEdge]
  );

  // Handle new connections
  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find(node => node.id === connection.source);
      const targetNode = nodes.find(node => node.id === connection.target);
      
      if (isValidConnection(connection.sourceHandle, connection.targetHandle, sourceNode, targetNode)) {
        const newEdge = {
          id: `edge-${connection.source}-${connection.sourceHandle}-${connection.target}-${connection.targetHandle}`,
          source: connection.source || '',
          target: connection.target || '',
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
          animated: false,
        };
        
        setEdges((eds) => [...eds, newEdge]);
        // Select the newly created edge
        setSelectedEdge(newEdge.id);
      }
    },
    [nodes]
  );

  // Handle edge selection
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    setSelectedEdge(edge.id);
  }, []);

  // Handle canvas click to deselect edges
  const onPaneClick = useCallback(() => {
    setSelectedEdge(null);
  }, []);

  // Add a new node from drag and drop
  const onAddNode = useCallback((type: NodeType, position: { x: number; y: number }) => {
    const newNode = createNode(type, position);
    setNodes((nds) => [...nds, newNode]);
  }, []);

  // Add a dynamic node from drag and drop
  const onAddDynamicNode = useCallback((configId: string, position: { x: number; y: number }) => {
    try {
      const newNode = createDynamicNode(configId, position);
      setNodes((nds) => [...nds, newNode]);
    } catch (error) {
      console.error('Failed to create dynamic node:', error);
      // You could add a toast notification here
    }
  }, []);

  // Drag and drop handlers
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!reactFlowBounds) return;

    try {
      const nodeDataStr = event.dataTransfer.getData('application/reactflow');
      if (!nodeDataStr) return;

      const nodeData = JSON.parse(nodeDataStr);
      
      // Convert screen coordinates to flow coordinates
      const position = reactFlow.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Add the node based on its type
      if (nodeData.type === 'basic' && nodeData.nodeType) {
        onAddNode(nodeData.nodeType, position);
      } else if (nodeData.type === 'dynamic' && nodeData.configId) {
        onAddDynamicNode(nodeData.configId, position);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  }, [reactFlow, onAddNode, onAddDynamicNode]);

  // Add input node from S3 file
  const onAddInputNodeFromS3 = useCallback((columnNames: string[], sourceFile: string) => {
    // Create a new input node with column data from the S3 file
    const position = { x: 100, y: 100 };
    
    // If there are existing nodes, position the new node at the top left
    if (nodes.length > 0) {
      const minX = Math.min(...nodes.map(node => node.position.x)) - 300;
      const minY = Math.min(...nodes.map(node => node.position.y));
      position.x = minX > 50 ? minX : 50;
      position.y = minY;
    }
    
    // Create the input node with column names
    const newNode = createNode(NodeType.INPUT, position);
    
    // Update the node data with column names and source file
    const nodeData = newNode.data as unknown as InputNodeData;
    nodeData.column_names = columnNames;
    nodeData.source_file = sourceFile;
    
    // Add the new node to the flow
    setNodes((nds) => [...nds, newNode]);
    
    // Show a notification
    setShowNotification(true);
  }, [nodes]);

  // Handle keyboard events for deleting edges
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedEdge) {
        // Prevent backspace from navigating back
        if (event.key === 'Backspace') {
          event.preventDefault();
        }
        
        // Remove the selected edge
        setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge));
        setSelectedEdge(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedEdge]);
    
  return (
    <>
      {/* S3 Explorer Sidebar */}
      {isS3ExplorerOpen && (
        <div className="app-sidebar">
          <NodePalette 
            onAddNode={onAddNode}
            onAddDynamicNode={onAddDynamicNode}
          />
          <S3ExplorerPanel onAddInputNode={onAddInputNodeFromS3} />
        </div>
      )}
      
      {/* Main Content Area */}
      <div className="app-main">
        {/* Feature notification */}
        {showNotification && (
          <div className="notification">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <span className="font-bold">New Feature:</span> Click on a connection line to select it, then press Delete or Backspace to remove it.
              <button 
                className="ml-3 text-white underline focus:outline-none" 
                onClick={() => setShowNotification(false)}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        
        {/* ReactFlow Viewport */}
        <div className="app-viewport" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            fitView
            edgesFocusable={true}
            selectNodesOnDrag={false}
          >
            <Background 
              color="#aaa" 
              gap={16} 
              size={1} 
            />
            <Controls />
            
            <Panel position="top-left" className="bg-white p-3 rounded-md shadow-md">
              <h3 className="text-lg font-bold mb-2">CSV Transformation Editor</h3>
              <p className="text-sm text-gray-600">Drag nodes from the sidebar to add them</p>
            </Panel>

            <Panel position="top-right" className="bg-white p-3 rounded-md shadow-md flex gap-3">
              <button 
                className="btn btn-primary"
                onClick={() => setIsPreviewOpen(true)}
              >
                Preview Transformation
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setIsExportOpen(true)}
              >
                Export Config
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setIsS3ExplorerOpen(!isS3ExplorerOpen)}
              >
                {isS3ExplorerOpen ? 'Hide S3 Explorer' : 'Show S3 Explorer'}
              </button>
              {selectedEdge && (
                <button 
                  className="btn btn-destructive"
                  onClick={() => {
                    setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge));
                    setSelectedEdge(null);
                  }}
                >
                  Delete Connection
                </button>
              )}
            </Panel>
          </ReactFlow>
        </div>
        
        {/* Preview Panel Modal */}
        {isPreviewOpen && (
          <PreviewPanel 
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            nodes={nodes}
            edges={edges}
          />
        )}
        
        {/* Export Config Panel Modal */}
        {isExportOpen && (
          <ExportConfigPanel 
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
            nodes={nodes}
            edges={edges}
          />
        )}
      </div>
    </>
  );
};

export default FlowWithProvider;