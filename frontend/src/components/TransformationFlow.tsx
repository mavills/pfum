"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
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
  Edge,
  Connection,
  addEdge,
} from "@xyflow/react";

// Components
import InputNode from "./nodes/InputNode";
import DynamicNode from "./nodes/DynamicNode";
import ConfigurationPanel from "./panels/configuration/ConfigurationPanel";
import PreviewPanel from "./panels/PreviewPanel";
import ExportConfigPanel from "./panels/ExportConfigPanel";

// Types and utilities
import { NodeType, InputNodeData } from "../types";
import { createNode, createDynamicNode } from "../utils/nodeUtils";
import { loadConfigurationsFromPublicDirectory } from "../utils/configLoader";
import {
  generateGraphExportJSON,
  importGraphFromJSON,
} from "../utils/exportUtils";

const nodeTypes = {
  customInput: InputNode,
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
        const configIds = await loadConfigurationsFromPublicDirectory();
      } catch (error) {
        console.error("Failed to load configurations:", error);
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

  // ReactFlow hooks
  const { screenToFlowPosition } = useReactFlow();

  // Handle connections between nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((oldEdges: Edge[]): Edge[] => addEdge(connection, oldEdges));
    },
    [setEdges]
  );

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
    event.preventDefault();
    // Match the effectAllowed from the drag source
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      try {
        // Try to get data in multiple formats
        let nodeDataStr = event.dataTransfer.getData("application/reactflow");

        if (!nodeDataStr) {
          nodeDataStr = event.dataTransfer.getData("text/plain");
        }

        if (!nodeDataStr) {
          return;
        }

        const nodeData = JSON.parse(nodeDataStr);

        // Convert screen coordinates to flow coordinates
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        // Add the node based on its type
        if (nodeData.type === "basic" && nodeData.nodeType) {
          onAddNode(nodeData.nodeType, position);
        } else if (nodeData.type === "dynamic" && nodeData.configId) {
          onAddDynamicNode(nodeData.configId, position);
        } else {
        }
      } catch (error) {
        console.error("Error handling drop:", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
    [screenToFlowPosition]
  );

  // Add a new node from drag and drop
  const onAddNode = useCallback(
    (type: NodeType, position: { x: number; y: number }) => {
      const newNode = createNode(type, position);
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  // Add a dynamic node
  const onAddDynamicNode = useCallback(
    (configId: string, position: { x: number; y: number }) => {
      try {
        const newNode = createDynamicNode(configId, position);
        setNodes((nds) => [...nds, newNode]);
      } catch (error) {
        console.error("Failed to create dynamic node:", error);
      }
    },
    [setNodes]
  );

  // Add input node from S3 file
  const onAddInputNodeFromS3 = useCallback(
    (columnNames: string[], sourceFile: string) => {
      // Create a new input node with column data from the S3 file
      const position = { x: 100, y: 100 };

      // If there are existing nodes, position the new node at the top left
      if (nodes.length > 0) {
        const minX = Math.min(...nodes.map((node) => node.position.x)) - 300;
        const minY = Math.min(...nodes.map((node) => node.position.y));
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
    },
    [nodes, setNodes]
  );

  // Export graph to new tab
  const onExportGraph = useCallback(() => {
    try {
      const exportData = generateGraphExportJSON(nodes, edges);

      // Store data in sessionStorage for the new tab
      sessionStorage.setItem("graph-export-data", exportData);

      // Open export page in new tab
      const exportUrl = `${window.location.origin}/export`;
      window.open(exportUrl, "_blank");

      console.log("✅ [EXPORT] Graph exported to new tab");
    } catch (error) {
      console.error("❌ [EXPORT] Failed to export graph:", error);
      // Fallback to old export panel
      setIsExportOpen(true);
    }
  }, [nodes, edges]);

  // Import graph from clipboard
  const onImportGraphFromClipboard = useCallback(async (): Promise<void> => {
    try {
      // Check if clipboard API is available
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        throw new Error("Clipboard API not available in this browser");
      }

      console.log("📋 [IMPORT] Reading from clipboard...");
      const clipboardText = await navigator.clipboard.readText();

      if (!clipboardText.trim()) {
        throw new Error("Clipboard is empty");
      }

      console.log("📋 [IMPORT] Parsing graph data...");
      const { nodes: importedNodes, edges: importedEdges } =
        importGraphFromJSON(clipboardText);

      // Clear current graph and set imported data
      console.log(
        "📋 [IMPORT] Clearing current graph and importing new data..."
      );
      setNodes(importedNodes);
      setEdges(importedEdges);

      console.log(
        `✅ [IMPORT] Successfully imported ${importedNodes.length} nodes and ${importedEdges.length} edges`
      );
    } catch (error) {
      console.error("❌ [IMPORT] Failed to import graph:", error);

      // Show error to user - you can replace this with a proper notification system
      alert(
        `Failed to import graph: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }, [setNodes, setEdges]);

  // Handle keyboard events for deleting edges
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedEdge
      ) {
        // Prevent backspace from navigating back
        if (event.key === "Backspace") {
          event.preventDefault();
        }

        // Remove the selected edge
        setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge));
        setSelectedEdge(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
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
        onExportGraph={onExportGraph}
        onImportGraphFromClipboard={onImportGraphFromClipboard}
        onToggleS3Explorer={() => setIsS3ExplorerOpen(!isS3ExplorerOpen)}
        isS3ExplorerOpen={isS3ExplorerOpen}
      />

      {/* Main Content Area */}
      <div className="app-main">
        {/* ReactFlow Viewport */}
        <div className="app-viewport">
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
            <Background color="#aaa" gap={16} size={1} />
            <Controls />
            {/* 
            <Panel
              position="top-left"
              className="bg-white p-3 rounded-md shadow-md"
            >
              <h3 className="text-lg font-bold mb-2">
                CSV Transformation Editor
              </h3>
              <p className="text-sm text-gray-600">
                Drag nodes from the sidebar to add them
              </p>
            </Panel> */}

            {/* {selectedEdge && (
              <Panel
                position="top-right"
                className="bg-white p-3 rounded-md shadow-md"
              >
                <button
                  className="btn btn-destructive"
                  onClick={() => {
                    setEdges((eds) =>
                      eds.filter((edge) => edge.id !== selectedEdge)
                    );
                    setSelectedEdge(null);
                  }}
                >
                  Delete Connection
                </button>
              </Panel>
            )} */}
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
