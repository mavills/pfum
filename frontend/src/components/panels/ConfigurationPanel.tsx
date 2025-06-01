"use client";

import React, { useState, useEffect } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { 
  ChevronDown, 
  GripVertical, 
  FileInput, 
  FileOutput, 
  Type, 
  Sparkles,
  Settings,
  FolderOpen,
  Eye,
  Download,
  Search,
  X
} from 'lucide-react';
import { NodeType } from '../../types';
import { nodeConfigService } from '../../services/nodeConfigService';

interface S3File {
  key: string;
  size: number;
  last_modified: string;
  is_csv: boolean;
}

interface ConfigurationPanelProps {
  onAddNode: (type: NodeType, position: { x: number; y: number }) => void;
  onAddDynamicNode: (configId: string, position: { x: number; y: number }) => void;
  onAddInputNodeFromS3: (columnNames: string[], sourceFile: string) => void;
  onPreviewTransformation: () => void;
  onExportConfig: () => void;
  onToggleS3Explorer: () => void;
  isS3ExplorerOpen: boolean;
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
    console.log('🚀 [DRAG-START] Starting drag for:', title);
    
    const nodeData = {
      type,
      nodeType,
      configId,
      title
    };
    
    console.log('📦 [DRAG-DATA] Node data:', nodeData);
    
    // Set the data in multiple formats to ensure compatibility
    const dataString = JSON.stringify(nodeData);
    event.dataTransfer.setData('application/reactflow', dataString);
    event.dataTransfer.setData('text/plain', dataString);
    
    // Set the effect to copy
    event.dataTransfer.effectAllowed = 'copy';
    
    console.log('✅ [DRAG-CONFIG] DataTransfer configured:', {
      effectAllowed: event.dataTransfer.effectAllowed,
      types: Array.from(event.dataTransfer.types)
    });
    
    // Create a cleaner drag image
    const dragImage = document.createElement('div');
    dragImage.innerHTML = title;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.left = '-1000px';
    dragImage.style.background = '#4a5568';
    dragImage.style.color = 'white';
    dragImage.style.padding = '6px 10px';
    dragImage.style.borderRadius = '4px';
    dragImage.style.fontSize = '12px';
    dragImage.style.fontWeight = '500';
    dragImage.style.pointerEvents = 'none';
    dragImage.style.zIndex = '-1';
    
    document.body.appendChild(dragImage);
    
    try {
      event.dataTransfer.setDragImage(dragImage, 50, 15);
      console.log('🖼️ [DRAG-IMAGE] Custom drag image set');
    } catch (error) {
      console.warn('⚠️ [DRAG-IMAGE] Failed to set custom drag image:', error);
    }
    
    // Clean up the drag image after a short delay
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
        console.log('🧹 [CLEANUP] Drag image removed');
      }
    }, 100);
  };

  const handleClick = () => {
    const defaultPosition = { x: 250, y: 250 };
    
    if (type === 'basic' && nodeType) {
      onAddNode(nodeType, defaultPosition);
    } else if (type === 'dynamic' && configId) {
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
      
      <div className="config-node-icon">
        {icon}
      </div>
      
      <div className="config-node-content">
        <div className="config-node-title">{title}</div>
        <div className="config-node-description">{description}</div>
      </div>
    </div>
  );
};

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  onAddNode,
  onAddDynamicNode,
  onAddInputNodeFromS3,
  onPreviewTransformation,
  onExportConfig,
  onToggleS3Explorer,
  isS3ExplorerOpen
}) => {
  // S3 Explorer state
  const [prefix, setPrefix] = useState<string>('');
  const [files, setFiles] = useState<S3File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      icon: <FileInput size={14} />
    },
    {
      type: 'basic' as const,
      nodeType: NodeType.OUTPUT,
      title: 'Output Node', 
      description: 'Define output entity structure',
      icon: <FileOutput size={14} />
    },
    {
      type: 'basic' as const,
      nodeType: NodeType.STRING_CONCAT,
      title: 'String Concatenation',
      description: 'Combine strings with separator',
      icon: <Type size={14} />
    }
  ];

  // Fetch S3 files when prefix changes
  useEffect(() => {
    if (!isS3ExplorerOpen) return;
    
    const fetchFiles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:8000/api/v1/s3/list?prefix=${encodeURIComponent(prefix)}`);
        
        if (!response.ok) {
          throw new Error(`Error listing S3 files: ${response.statusText}`);
        }
        
        const data = await response.json();
        setFiles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error('Error fetching S3 files:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFiles();
  }, [prefix, isS3ExplorerOpen]);

  // Handle S3 file click
  const handleFileClick = async (file: S3File) => {
    if (!file.is_csv) {
      setError('Only CSV files can be loaded as input nodes');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:8000/api/v1/s3/columns?file_key=${encodeURIComponent(file.key)}`);
      
      if (!response.ok) {
        throw new Error(`Error getting CSV columns: ${response.statusText}`);
      }
      
      const columns = await response.json();
      onAddInputNodeFromS3(columns, file.key);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching CSV columns:', err);
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    const kilobytes = bytes / 1024;
    if (kilobytes < 1024) return `${kilobytes.toFixed(1)} KB`;
    const megabytes = kilobytes / 1024;
    return `${megabytes.toFixed(1)} MB`;
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="config-panel">
      <div className="config-panel-header">
        <h2 className="config-panel-title">Configuration</h2>
      </div>

      <div className="config-panel-content">
        <Accordion.Root type="multiple" defaultValue={["general", "nodes"]} className="config-accordion">
          
          {/* General Settings */}
          <Accordion.Item value="general" className="config-accordion-item">
            <Accordion.Trigger className="config-accordion-trigger">
              <Settings size={16} />
              <span>General</span>
              <ChevronDown size={14} className="config-accordion-chevron" />
            </Accordion.Trigger>
            <Accordion.Content className="config-accordion-content">
              <div className="config-section-content">
                <button 
                  className="config-action-button"
                  onClick={onPreviewTransformation}
                >
                  <Eye size={14} />
                  <span>Preview Transformation</span>
                </button>
                <button 
                  className="config-action-button"
                  onClick={onExportConfig}
                >
                  <Download size={14} />
                  <span>Export Configuration</span>
                </button>
                <button 
                  className="config-action-button"
                  onClick={onToggleS3Explorer}
                >
                  <FolderOpen size={14} />
                  <span>{isS3ExplorerOpen ? 'Hide' : 'Show'} S3 Explorer</span>
                </button>
              </div>
            </Accordion.Content>
          </Accordion.Item>

          {/* Add Nodes */}
          <Accordion.Item value="nodes" className="config-accordion-item">
            <Accordion.Trigger className="config-accordion-trigger">
              <Sparkles size={16} />
              <span>Add Nodes</span>
              <ChevronDown size={14} className="config-accordion-chevron" />
            </Accordion.Trigger>
            <Accordion.Content className="config-accordion-content">
              <div className="config-section-content">
                
                {/* Basic Nodes */}
                <div className="config-subsection">
                  <div className="config-subsection-title">Basic Nodes</div>
                  <div className="config-node-list">
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
                  </div>
                </div>

                {/* Dynamic Node Categories */}
                {Object.entries(dynamicCategories).map(([categoryName, configs]) => (
                  <div key={categoryName} className="config-subsection">
                    <div className="config-subsection-title">{categoryName}</div>
                    <div className="config-node-list">
                      {configs.map(({ id, config }) => (
                        <DraggableNode
                          key={id}
                          type="dynamic"
                          configId={id}
                          title={config.name}
                          description={config.description || 'Custom node configuration'}
                          icon={<Sparkles size={14} />}
                          onAddNode={onAddNode}
                          onAddDynamicNode={onAddDynamicNode}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Accordion.Content>
          </Accordion.Item>

          {/* File Settings (S3 Explorer) */}
          {isS3ExplorerOpen && (
            <Accordion.Item value="files" className="config-accordion-item">
              <Accordion.Trigger className="config-accordion-trigger">
                <FolderOpen size={16} />
                <span>File Settings</span>
                <ChevronDown size={14} className="config-accordion-chevron" />
              </Accordion.Trigger>
              <Accordion.Content className="config-accordion-content">
                <div className="config-section-content">
                  
                  {/* Search input */}
                  <div className="config-search-container">
                    <div className="config-search-input-wrapper">
                      <Search size={12} className="config-search-icon" />
                      <input
                        type="text"
                        placeholder="Search files..."
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value)}
                        className="config-search-input"
                      />
                      {prefix && (
                        <button 
                          className="config-search-clear"
                          onClick={() => setPrefix('')}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Error display */}
                  {error && (
                    <div className="config-error">
                      <p>{error}</p>
                      <button 
                        className="config-error-dismiss"
                        onClick={() => setError(null)}
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {/* Loading indicator */}
                  {loading && (
                    <div className="config-loading">
                      <div className="config-loading-spinner"></div>
                      <span>Loading files...</span>
                    </div>
                  )}

                  {/* File list */}
                  <div className="config-file-list">
                    {files.length === 0 && !loading ? (
                      <div className="config-empty-state">
                        No files found with the given prefix
                      </div>
                    ) : (
                      files.map((file, index) => (
                        <div 
                          key={index}
                          className={`config-file-item ${file.is_csv ? 'csv' : 'disabled'}`}
                          onClick={() => file.is_csv && handleFileClick(file)}
                        >
                          <div className="config-file-icon">
                            {file.is_csv ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14,2 14,8 20,8"/>
                                <line x1="12" y1="18" x2="12" y2="12"/>
                                <line x1="9" y1="15" x2="15" y2="15"/>
                              </svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14,2 14,8 20,8"/>
                              </svg>
                            )}
                          </div>
                          
                          <div className="config-file-details">
                            <div className="config-file-name">{file.key.split('/').pop()}</div>
                            <div className="config-file-meta">
                              <span>{formatFileSize(file.size)}</span>
                              <span>{formatDate(file.last_modified)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Accordion.Content>
            </Accordion.Item>
          )}
        </Accordion.Root>
      </div>
    </div>
  );
};

export default ConfigurationPanel; 