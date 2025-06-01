"use client";

import React, { useEffect, useState } from 'react';
import { Copy, Download, ArrowLeft } from 'lucide-react';

export default function ExportPage() {
  const [exportData, setExportData] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [metadata, setMetadata] = useState<{
    exported_at: string;
    node_count: number;
    edge_count: number;
    export_format: string;
  } | null>(null);

  useEffect(() => {
    // Get export data from sessionStorage (set by the main app)
    const storedData = sessionStorage.getItem('graph-export-data');
    if (storedData) {
      setExportData(storedData);
      
      // Parse metadata for display
      try {
        const parsed = JSON.parse(storedData);
        setMetadata(parsed.metadata);
      } catch (error) {
        console.error('Failed to parse export data:', error);
      }
    }
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transformation-graph-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBack = () => {
    window.close();
  };

  if (!exportData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Export Data</h1>
          <p className="text-gray-600 mb-6">No graph export data found. Please export from the main application.</p>
          <button
            onClick={handleBack}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Graph Export</h1>
            {metadata && (
              <p className="text-sm text-gray-600 mt-1">
                Exported on {new Date(metadata.exported_at).toLocaleString()} • 
                {metadata.node_count} nodes, {metadata.edge_count} edges
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Copy size={16} />
              {copied ? 'Copied!' : 'Copy JSON'}
            </button>
            
            <button
              onClick={handleDownload}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <Download size={16} />
              Download
            </button>
            
            <button
              onClick={handleBack}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">JSON Configuration</h2>
            <p className="text-sm text-gray-600 mt-1">
              This JSON contains your complete graph structure and can be sent to APIs for processing.
            </p>
          </div>
          
          <div className="p-0">
            <pre className="bg-gray-900 text-gray-100 p-6 overflow-auto text-sm leading-relaxed font-mono whitespace-pre-wrap max-h-[70vh] min-h-[400px]">
              <code>{exportData}</code>
            </pre>
          </div>
        </div>
        
        {/* Footer Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Export Format Information</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Version:</strong> 2.0 - New graph export format with full node configurations</p>
            <p><strong>Structure:</strong> Contains complete node definitions with configurations and clean edge mappings</p>
            <p><strong>Usage:</strong> This JSON can be sent to downstream APIs for graph processing and validation</p>
          </div>
        </div>
      </div>
    </div>
  );
} 