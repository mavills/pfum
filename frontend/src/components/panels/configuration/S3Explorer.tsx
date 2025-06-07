import React, { useState, useEffect } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown, FolderOpen, Search, X } from "lucide-react";
import { formatFileSize, formatDate } from "./utils";

export interface S3File {
  key: string;
  size: number;
  last_modified: string;
  is_csv: boolean;
}

interface S3ExplorerProps {
  onAddInputNodeFromS3: (columnNames: string[], sourceFile: string) => void;
}

const S3Explorer: React.FC<S3ExplorerProps> = ({ onAddInputNodeFromS3 }) => {
  // S3 Explorer state
  const [prefix, setPrefix] = useState<string>("");
  const [files, setFiles] = useState<S3File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
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
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
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
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default S3Explorer;
