"use client";

import React, { useState, useEffect } from 'react';
import { NodeType } from '../../types';

interface S3File {
  key: string;
  size: number;
  last_modified: string;
  is_csv: boolean;
}

interface S3ExplorerPanelProps {
  onAddInputNode: (columnNames: string[], sourceFile: string) => void;
}

const S3ExplorerPanel: React.FC<S3ExplorerPanelProps> = ({ onAddInputNode }) => {
  const [prefix, setPrefix] = useState<string>('');
  const [files, setFiles] = useState<S3File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch files when prefix changes
  useEffect(() => {
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
  }, [prefix]);

  // Handle file click - get columns and add input node
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
      
      // Call the parent function to add an input node with these columns
      onAddInputNode(columns, file.key);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching CSV columns:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    const kilobytes = bytes / 1024;
    if (kilobytes < 1024) return `${kilobytes.toFixed(1)} KB`;
    const megabytes = kilobytes / 1024;
    return `${megabytes.toFixed(1)} MB`;
  };
  
  // Format last modified date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="s3-explorer-panel bg-white shadow-lg rounded-md overflow-hidden border border-gray-200 w-72">
      {/* Header */}
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">S3 Explorer</h3>
        <p className="text-sm text-gray-600">Browse and select CSV files</p>
      </div>
      
      {/* Search prefix input */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search files..."
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            className="form-input w-full text-sm"
          />
          <button 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
            onClick={() => setPrefix('')}
          >
            {prefix && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Error display */}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 border-b border-red-200 text-sm">
          <p>{error}</p>
          <button 
            className="text-red-600 underline mt-1 text-xs"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <div className="p-3 text-center">
          <div className="animate-spin inline-block w-5 h-5 border-2 border-gray-400 border-t-blue-600 rounded-full mr-2"></div>
          <span className="text-gray-600 text-sm">Loading...</span>
        </div>
      )}
      
      {/* File list */}
      <div className="overflow-y-auto h-96">
        {files.length === 0 && !loading ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No files found with the given prefix
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {files.map((file, index) => (
              <li 
                key={index}
                className={`
                  hover:bg-gray-50 cursor-pointer p-3
                  ${file.is_csv ? 'text-gray-900' : 'text-gray-500'}
                `}
                onClick={() => file.is_csv && handleFileClick(file)}
              >
                <div className="flex items-start">
                  {/* File icon */}
                  <div className="flex-shrink-0 mt-1">
                    {file.is_csv ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  
                  {/* File details */}
                  <div className="ml-3 truncate">
                    <p className="text-sm font-medium truncate">{file.key.split('/').pop()}</p>
                    <div className="flex space-x-3 text-xs text-gray-500 mt-1">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{formatDate(file.last_modified)}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default S3ExplorerPanel; 