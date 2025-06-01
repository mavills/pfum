"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  ReactFlowProvider,
  ReactFlow, 
  Background, 
  Controls, 
  Panel,
  useNodesState, 
  useEdgesState,
  useReactFlow,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Components
import InputNode from './nodes/InputNode';
import OutputNode from './nodes/OutputNode';
import StringConcatNode from './nodes/StringConcatNode';
import DynamicNode from './nodes/DynamicNode';
import ConfigurationPanel from './panels/ConfigurationPanel';
import PreviewPanel from './panels/PreviewPanel';
import ExportConfigPanel from './panels/ExportConfigPanel';

// Types and utilities
import { NodeType, InputNodeData } from '../types';
import { createNode, createDynamicNode } from '../utils/nodeUtils';
import { loadConfigurationsFromPublicDirectory } from '../utils/configLoader';

const nodeTypes = {
  input: InputNode,
  output: OutputNode,
  string_concat: StringConcatNode,
  dynamic: DynamicNode,
};

// Main wrapper component with ReactFlowProvider
const TransformationFlow: React.FC = () => {
  return (
    <ReactFlowProvider>
      <FlowContent />
    </ReactFlowProvider>
  );
};

// FlowContent component (the main flow logic)
const FlowContent: React.FC = () => {
  // Initialize configurations from files on first render
  useEffect(() => {
    const loadConfigurations = async () => {
      try {
        console.log('🚀 [APP-INIT] Loading configurations from public directory...');
        const configIds = await loadConfigurationsFromPublicDirectory();
        console.log('✅ [APP-INIT] Loaded configurations:', configIds);
      } catch (error) {
        console.error('❌ [APP-INIT] Failed to load configurations:', error);
        // Fallback to empty state - user can still use basic nodes
      }
    };
    
    loadConfigurations();
  }, []);

  // State for nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  
  // UI state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isS3ExplorerOpen, setIsS3ExplorerOpen] = useState(true);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  // ReactFlow hooks
  const { screenToFlowPosition } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Handle connections between nodes
  const onConnect = useCallback((params: any) => {
    const edgeId = `edge-${params.source}-${params.sourceHandle}-${params.target}-${params.targetHandle}`;
    
    const newEdge: Edge = {
      id: edgeId,
      source: params.source,
      target: params.target,
      sourceHandle: params.sourceHandle,
      targetHandle: params.targetHandle,
      animated: false,
      style: { strokeWidth: 2 },
    };
    
    setEdges((eds) => [...eds, newEdge]);
  }, [setEdges]);

  // Handle edge selection
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    setSelectedEdge(edge.id);
  }, []);

  // Handle pane click to deselect
  const onPaneClick = useCallback(() => {
    setSelectedEdge(null);
  }, []);

  // Drag and drop handlers
  const onDragOver = useCallback((event: React.DragEvent) => {
    console.log('🔄 [DRAG-OVER] Drag over detected', {
      clientX: event.clientX,
      clientY: event.clientY,
      dataTransfer: {
        effectAllowed: event.dataTransfer.effectAllowed,
        dropEffect: event.dataTransfer.dropEffect,
        types: Array.from(event.dataTransfer.types)
      }
    });

    event.preventDefault();
    // Match the effectAllowed from the drag source
    event.dataTransfer.dropEffect = 'copy';
    
    console.log('✅ [DRAG-OVER] Drop effect set to copy');
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    console.log('🎯 [DROP] Drop event triggered!', {
      clientX: event.clientX,
      clientY: event.clientY,
      dataTransfer: {
        effectAllowed: event.dataTransfer.effectAllowed,
        dropEffect: event.dataTransfer.dropEffect,
        types: Array.from(event.dataTransfer.types)
      }
    });

    event.preventDefault();
    event.stopPropagation();

    try {
      // Try to get data in multiple formats
      let nodeDataStr = event.dataTransfer.getData('application/reactflow');
      console.log('📥 [DROP-DATA] ReactFlow data:', nodeDataStr);
      
      if (!nodeDataStr) {
        nodeDataStr = event.dataTransfer.getData('text/plain');
        console.log('📥 [DROP-DATA] Fallback to text/plain:', nodeDataStr);
      }
      
      if (!nodeDataStr) {
        console.log('❌ [DROP-ERROR] No data found in any format');
        console.log('Available types:', Array.from(event.dataTransfer.types));
        return;
      }

      const nodeData = JSON.parse(nodeDataStr);
      console.log('📦 [DROP-PARSED] Parsed node data:', nodeData);
      
      // Convert screen coordinates to flow coordinates
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      console.log('📍 [DROP-POSITION] Calculated position:', position);

      // Add the node based on its type
      if (nodeData.type === 'basic' && nodeData.nodeType) {
        console.log('🟦 [DROP-BASIC] Adding basic node:', nodeData.nodeType);
        onAddNode(nodeData.nodeType, position);
      } else if (nodeData.type === 'dynamic' && nodeData.configId) {
        console.log('🟪 [DROP-DYNAMIC] Adding dynamic node:', nodeData.configId);
        onAddDynamicNode(nodeData.configId, position);
      } else {
        console.log('❓ [DROP-UNKNOWN] Unknown node type:', nodeData);
      }
      
      console.log('✅ [DROP-SUCCESS] Node should be added to canvas');
    } catch (error) {
      console.error('❌ [DROP-ERROR] Error handling drop:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }, [screenToFlowPosition]);

  // Add a new node from drag and drop
  const onAddNode = useCallback((type: NodeType, position: { x: number; y: number }) => {
    const newNode = createNode(type, position);
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  // Add a dynamic node
  const onAddDynamicNode = useCallback((configId: string, position: { x: number; y: number }) => {
    try {
      const newNode = createDynamicNode(configId, position);
      setNodes((nds) => [...nds, newNode]);
    } catch (error) {
      console.error('Failed to create dynamic node:', error);
    }
  }, [setNodes]);

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
    // setShowNotification(true);
  }, [nodes, setNodes]);

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
  }, [selectedEdge, setEdges]);
    
  return (
    <>
      {/* Configuration Sidebar */}
      <ConfigurationPanel
        onAddNode={onAddNode}
        onAddDynamicNode={onAddDynamicNode}
        onAddInputNodeFromS3={onAddInputNodeFromS3}
        onPreviewTransformation={() => setIsPreviewOpen(true)}
        onExportConfig={() => setIsExportOpen(true)}
        onToggleS3Explorer={() => setIsS3ExplorerOpen(!isS3ExplorerOpen)}
        isS3ExplorerOpen={isS3ExplorerOpen}
      />
      
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
        <div 
          className="app-viewport" 
          ref={reactFlowWrapper}
        >
          <ReactFlow
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
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

            {selectedEdge && (
              <Panel position="top-right" className="bg-white p-3 rounded-md shadow-md">
                <button 
                  className="btn btn-destructive"
                  onClick={() => {
                    setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge));
                    setSelectedEdge(null);
                  }}
                >
                  Delete Connection
                </button>
              </Panel>
            )}
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

export default TransformationFlow;