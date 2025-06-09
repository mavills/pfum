import React, { useState, useEffect, useRef } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown, FolderOpen, Search, X, Upload, GripVertical, Sparkles } from "lucide-react";
import { formatFileSize, formatDate } from "./utils";
import DraggableNode from "./DraggableNode";

export interface S3File {
  key: string;
  size: number;
  last_modified: string;
  is_csv: boolean;
}

interface S3ExplorerProps {
  onAddInputNodeFromS3: (columnNames: string[], sourceFile: string) => void;
}

interface LocalFileInfo {
  id: string; // Unique identifier for each file
  name: string;
  size: number;
  path: string;
  type: string;
  lastModified: number;
}

const S3Explorer: React.FC<S3ExplorerProps> = ({ onAddInputNodeFromS3 }) => {
  // S3 Explorer state
  const [prefix, setPrefix] = useState<string>("");
  const [files, setFiles] = useState<S3File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Local files state - now supporting multiple files
  const [selectedLocalFiles, setSelectedLocalFiles] = useState<LocalFileInfo[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch S3 files when prefix changes
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `http://localhost:8000/api/v1/s3/list?prefix=${encodeURIComponent(
            prefix
          )}`
        );

        if (!response.ok) {
          throw new Error(`Error listing S3 files: ${response.statusText}`);
        }

        const data = await response.json();
        setFiles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        console.error("Error fetching S3 files:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [prefix]);

  // Handle S3 file click
  const handleFileClick = async (file: S3File) => {
    if (!file.is_csv) {
      setError("Only CSV files can be loaded as input nodes");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:8000/api/v1/s3/columns?file_key=${encodeURIComponent(
          file.key
        )}`
      );

      if (!response.ok) {
        throw new Error(`Error getting CSV columns: ${response.statusText}`);
      }

      const columns = await response.json();
      onAddInputNodeFromS3(columns, file.key);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Error fetching CSV columns:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle local file selection - now adds to array
  const handleLocalFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is already selected
      const existingFile = selectedLocalFiles.find(f => f.name === file.name && f.size === file.size);
      if (existingFile) {
        setError(`File "${file.name}" is already selected`);
        return;
      }

      const fileInfo: LocalFileInfo = {
        id: `${file.name}-${file.size}-${Date.now()}`, // Unique ID
        name: file.name,
        size: file.size,
        path: (file as any).path || file.name,
        type: file.type,
        lastModified: file.lastModified
      };
      
      setSelectedLocalFiles(prev => [...prev, fileInfo]);
      setError(null);
      
      // Reset the file input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle drag start for local file
  const handleLocalFileDragStart = (fileInfo: LocalFileInfo) => (event: React.DragEvent) => {
    console.log("🚀 [DRAG-START] Starting drag for local file:", fileInfo.name);

    const nodeData = {
      type: "localFile",
      fileInfo: fileInfo,
      title: fileInfo.name
    };

    console.log("📦 [DRAG-DATA] Local file data:", nodeData);

    // Set the data in multiple formats to ensure compatibility
    const dataString = JSON.stringify(nodeData);
    event.dataTransfer.setData("application/reactflow", dataString);
    event.dataTransfer.setData("text/plain", dataString);

    // Set the effect to copy
    event.dataTransfer.effectAllowed = "copy";

    // Create a cleaner drag image
    const dragImage = document.createElement("div");
    dragImage.innerHTML = `📁 ${fileInfo.name}`;
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
      console.log("🖼️ [DRAG-IMAGE] Custom drag image set for local file");
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

  // Handle local file button click (fallback for drag)
  const handleLocalFileButtonClick = (fileInfo: LocalFileInfo) => () => {
    // Click-to-add functionality for local files
    // TODO: Implement click-to-add functionality for local files
    console.log("📁 [LOCAL-FILE] Click to add local file:", fileInfo);
  };

  // Remove a specific local file
  const removeLocalFile = (fileId: string) => {
    setSelectedLocalFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Clear all local files
  const clearAllLocalFiles = () => {
    setSelectedLocalFiles([]);
  };

  return (
    <Accordion.Item value="files" className="config-accordion-item">
      <Accordion.Trigger className="config-accordion-trigger">
        <FolderOpen size={16} />
        <span>File Settings</span>
        <ChevronDown size={14} className="config-accordion-chevron" />
      </Accordion.Trigger>
      <Accordion.Content className="config-accordion-content">
        <div className="config-section-content">
          
          {/* Local File Selector */}
          <div className="config-subsection">
            <div className="config-subsection-title">
              Local Files ({selectedLocalFiles.length})
              {selectedLocalFiles.length > 0 && (
                <button
                  onClick={clearAllLocalFiles}
                  className=""
                  title="Clear all local files"
                  style={{ marginLeft: "8px", fontSize: "10px" }}
                >
                  Clear All
                </button>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt,.json"
              onChange={handleLocalFileSelect}
              style={{ display: "none" }}
            />
            
            {/* Always visible upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="config-action-button"
              style={{ width: "100%", marginBottom: "8px" }}
            >
              <Upload size={14} />
              <span>Select Local File</span>
            </button>

            {/* Selected local files list */}
            {selectedLocalFiles.length > 0 && (
              <div className="config-node-list">
                {selectedLocalFiles.map((fileInfo) => (
                  <DraggableNode
                    key={fileInfo.id}
                    type="dynamic"
                    configId={fileInfo.id}
                    title={fileInfo.name}
                    description={fileInfo.type || 'Custom node configuration'}
                    icon={<Sparkles size={14} />}
                    onAddNode={() => {}}
                    onAddDynamicNode={() => {}}
                  />
                  // <div
                  //   key={fileInfo.id}
                  //   draggable={true}
                  //   onDragStart={handleLocalFileDragStart(fileInfo)}
                  //   onClick={handleLocalFileButtonClick(fileInfo)}
                  //   className="config-node-item"
                  //   title={`Drag to canvas or click to add\nLocal file: ${fileInfo.name}`}
                  // >
                  //   <div className="config-node-drag-handle">
                  //     <GripVertical size={12} />
                  //   </div>
                    
                  //   <div className="config-node-icon">
                  //     <Upload size={14} />
                  //   </div>
                    
                  //   <div className="config-node-content">
                  //     <div className="config-node-title">{fileInfo.name}</div>
                  //     <div className="config-node-description">
                  //       {formatFileSize(fileInfo.size)} • {fileInfo.type || 'Unknown type'}
                  //     </div>
                  //   </div>
                    
                  //   <button
                  //     onClick={(e) => {
                  //       e.stopPropagation();
                  //       removeLocalFile(fileInfo.id);
                  //     }}
                  //     className="config-search-clear"
                  //     title="Remove this file"
                  //     style={{ position: "relative", marginLeft: "8px" }}
                  //   >
                  //     <X size={12} />
                  //   </button>
                  // </div>
                ))}
              </div>
            )}
          </div>

          {/* S3 Files Section */}
          <div className="config-subsection">
            <div className="config-subsection-title">S3 Files</div>
            
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
                    onClick={() => setPrefix("")}
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
                    className={`config-file-item ${
                      file.is_csv ? "csv" : "disabled"
                    }`}
                    onClick={() => file.is_csv && handleFileClick(file)}
                  >
                    <div className="config-file-icon">
                      {file.is_csv ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14,2 14,8 20,8" />
                          <line x1="12" y1="18" x2="12" y2="12" />
                          <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                      ) : (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2V8z" />
                          <polyline points="14,2 14,8 20,8" />
                        </svg>
                      )}
                    </div>

                    <div className="config-file-details">
                      <div className="config-file-name">
                        {file.key.split("/").pop()}
                      </div>
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
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default S3Explorer;
