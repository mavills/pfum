import React, { useState, useEffect, useRef } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import {
  ChevronDown,
  FolderOpen,
  Search,
  X,
  Upload,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { formatFileSize, formatDate } from "./utils";
import DraggableNode from "./DraggableNode";
import { operatorPubSub } from "@/services/templating/pubsub";
import { Operator } from "@/services/templating/operatorType";

export interface S3File {
  key: string;
  size: number;
  last_modified: string;
  is_csv: boolean;
}

interface S3ExplorerProps {
  onAddInputNodeFromS3: (columnNames: string[], sourceFile: string) => void;
}

interface UploadedFileInfo {
  id: string; // Backend file ID
  filename: string;
  operator?: Operator;
  isUploading?: boolean;
  isGeneratingTemplate?: boolean;
  uploadError?: string;
}

const S3Explorer: React.FC<S3ExplorerProps> = ({ onAddInputNodeFromS3 }) => {
  // S3 Explorer state
  const [prefix, setPrefix] = useState<string>("");
  const [files, setFiles] = useState<S3File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Local files state - now with full backend integration
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch S3 files when prefix changes
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `http://localhost:8000/s3/list?prefix=${encodeURIComponent(prefix)}`
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
        `http://localhost:8000/s3/columns?file_key=${encodeURIComponent(
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

  // Upload file to backend
  const createOperatorFromUploadedFile = async (
    file: File
  ): Promise<Operator> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://localhost:8000/nodes/file", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const uploadResult = await response.json();

    return uploadResult;
  };

  // Generate operator template from uploaded file
  const generateOperatorTemplate = async (
    fileInfo: UploadedFileInfo
  ): Promise<Operator> => {
    const response = await fetch(
      "http://localhost:8000/files/generate-node-template",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_id: fileInfo.id,
          node_title: `CSV Input: ${fileInfo.filename}`,
          node_description: `Input node for uploaded file: ${fileInfo.filename}`,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Template generation failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.operator;
  };

  // Handle local file selection and upload
  const handleLocalFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is CSV
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Only CSV files are supported");
      return;
    }

    // Check if file is already uploaded
    const existingFile = uploadedFiles.find((f) => f.filename === file.name);
    if (existingFile) {
      setError(`File "${file.name}" is already uploaded`);
      return;
    }

    // Create initial file info with uploading state
    const initialFileInfo: UploadedFileInfo = {
      id: `temp-${Date.now()}`,
      filename: file.name,
      isUploading: true,
    };

    setUploadedFiles((prev) => [...prev, initialFileInfo]);
    setError(null);

    try {
      // Upload file to backend
      const operator = await createOperatorFromUploadedFile(file);

      // Update file info with upload results
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === initialFileInfo.id
            ? {
                ...initialFileInfo,
                isUploading: false,
                operator,
              }
            : f
        )
      );

      // Register the operator with pubsub system
      operatorPubSub.loadConfigurations([operator]);

      console.log(`✅ Uploaded and registered operator: ${operator.title}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";

      // Update file info with error
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === initialFileInfo.id
            ? {
                ...f,
                isUploading: false,
                isGeneratingTemplate: false,
                uploadError: errorMessage,
              }
            : f
        )
      );

      setError(`Failed to process "${file.name}": ${errorMessage}`);
      console.error("Error processing file:", err);
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove uploaded file
  const removeUploadedFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Clear all uploaded files
  const clearAllUploadedFiles = () => {
    setUploadedFiles([]);
  };

  // Retry file processing
  const retryFileProcessing = async (fileInfo: UploadedFileInfo) => {
    if (!fileInfo.uploadError) return;

    setUploadedFiles((prev) =>
      prev.map((f) =>
        f.id === fileInfo.id
          ? { ...f, uploadError: undefined, isGeneratingTemplate: true }
          : f
      )
    );

    try {
      const operator = await generateOperatorTemplate(fileInfo);

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileInfo.id
            ? { ...f, operator, isGeneratingTemplate: false }
            : f
        )
      );

      operatorPubSub.loadConfigurations([operator]);
      console.log(`✅ Retried and registered operator: ${operator.title}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Retry failed";
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileInfo.id
            ? { ...f, isGeneratingTemplate: false, uploadError: errorMessage }
            : f
        )
      );
    }
  };

  return (
    <Accordion.Item value="files" className="config-accordion-item">
      <Accordion.Trigger className="config-accordion-trigger">
        <FolderOpen size={16} />
        <span>File Upload</span>
        <span className="config-node-count">
          ({uploadedFiles.length} uploaded)
        </span>
        <ChevronDown size={14} className="config-accordion-chevron" />
      </Accordion.Trigger>
      <Accordion.Content className="config-accordion-content">
        <div className="config-section-content">
          {/* Upload Status & Controls */}
          <div className="config-status-bar">
            <div className="config-status-info">
              <span className="config-status-text">
                {uploadedFiles.length === 0
                  ? "No files uploaded"
                  : `${uploadedFiles.filter((f) => f.operator).length}/${
                      uploadedFiles.length
                    } templates generated`}
              </span>
            </div>
            {uploadedFiles.length > 0 && (
              <button
                className="config-refresh-button"
                onClick={clearAllUploadedFiles}
                title="Clear all uploaded files"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>

          {/* Local File Upload */}
          <div className="config-subsection">
            <div className="config-subsection-title">Upload CSV Files</div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleLocalFileSelect}
              style={{ display: "none" }}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="config-action-button"
              style={{ width: "100%", marginBottom: "8px" }}
            >
              <Upload size={14} />
              <span>Select & Upload CSV File</span>
            </button>

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

            {/* Uploaded files list */}
            {uploadedFiles.length > 0 && (
              <div className="config-node-list">
                {uploadedFiles.map((fileInfo) => (
                  <div key={fileInfo.id} className="config-file-upload-item">
                    <div className="config-file-upload-header">
                      <div className="config-file-upload-name">
                        {fileInfo.filename}
                        <span className="config-file-upload-size">
                          ({formatFileSize(fileInfo.size)})
                        </span>
                      </div>
                      <button
                        onClick={() => removeUploadedFile(fileInfo.id)}
                        className="config-file-upload-remove"
                        title="Remove file"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    {fileInfo.isUploading && (
                      <div className="config-loading">
                        <div className="config-loading-spinner"></div>
                        <span>Uploading...</span>
                      </div>
                    )}

                    {fileInfo.isGeneratingTemplate && (
                      <div className="config-loading">
                        <div className="config-loading-spinner"></div>
                        <span>Generating template...</span>
                      </div>
                    )}

                    {fileInfo.uploadError && (
                      <div className="config-file-upload-error">
                        <p>{fileInfo.uploadError}</p>
                        <button
                          onClick={() => retryFileProcessing(fileInfo)}
                          className="config-action-button"
                          style={{ padding: "4px 8px", fontSize: "11px" }}
                        >
                          <RefreshCw size={10} />
                          Retry
                        </button>
                      </div>
                    )}

                    {fileInfo.operator && (
                      <div className="config-file-upload-success">
                        <div className="config-file-upload-columns">
                          <span>
                            Columns:{" "}
                            {fileInfo.operator.inputs
                              .map((input) => input.name)
                              .join(", ")}
                          </span>
                        </div>
                        <DraggableNode operator={fileInfo.operator} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* S3 Files Section */}
          <div className="config-subsection">
            <div className="config-subsection-title">S3 Files (Legacy)</div>

            {/* Search input */}
            <div className="config-search-container">
              <div className="config-search-input-wrapper">
                <Search size={12} className="config-search-icon" />
                <input
                  type="text"
                  placeholder="Search S3 files..."
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
                <span>Loading S3 files...</span>
              </div>
            )}

            {/* File list */}
            <div className="config-file-list">
              {files.length === 0 && !loading ? (
                <div className="config-empty-state">
                  No S3 files found with the given prefix
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
