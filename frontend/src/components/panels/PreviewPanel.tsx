"use client";

import React, { useState } from 'react';
import { CustomNode, CustomEdge } from '../../types';

interface PreviewPanelProps {
  nodes: CustomNode[];
  edges: CustomEdge[];
  isOpen: boolean;
  onClose: () => void;
}

interface PreviewResponse {
  transformed_data: Record<string, any>[];
  preview_csv_data: string;
  stats: {
    input_rows: number;
    output_rows: number;
    duration_ms: number;
    errors: string[];
    warnings: string[];
  };
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ nodes, edges, isOpen, onClose }) => {
  const [sourceFile, setSourceFile] = useState<string>('');
  const [previewLimit, setPreviewLimit] = useState<number>(100);
  const [previewData, setPreviewData] = useState<Record<string, any>[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handlePreview = async () => {
    if (!sourceFile) {
      setError('Please enter a source file path');
      return;
    }

    setIsLoading(true);
    setError(null);
    setWarnings([]);

    try {
      // Get the current configuration ID (you'll need to implement this)
      const configId = 'your-config-id';  // Replace with actual config ID

      const response = await fetch('/api/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config_id: configId,
          source_file: sourceFile,
          preview: true,
          limit: previewLimit,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data: PreviewResponse = await response.json();

      // Convert base64 CSV to array of objects
      if (data.preview_csv_data) {
        const csvString = atob(data.preview_csv_data);
        const rows = csvString.split('\n').filter(row => row.trim());  // Remove empty lines
        const headers = rows[0].split(',').map(header => 
          // Remove quotes from headers if present
          header.trim().replace(/^"(.*)"$/, '$1')
        );
        
        const parsedData = rows.slice(1).map(row => {
          // Handle quoted CSV values properly
          const values: string[] = [];
          let currentValue = '';
          let insideQuotes = false;
          
          for (let i = 0; i < row.length; i++) {
            const char = row[i];
            
            if (char === '"' && (i === 0 || row[i - 1] !== '\\')) {
              insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
              values.push(currentValue.trim().replace(/^"(.*)"$/, '$1'));
              currentValue = '';
            } else {
              currentValue += char;
            }
          }
          
          // Add the last value
          values.push(currentValue.trim().replace(/^"(.*)"$/, '$1'));
          
          // Create record with proper header mapping
          const record: Record<string, any> = {};
          headers.forEach((header, index) => {
            record[header] = values[index] || '';
          });
          return record;
        });

        setPreviewData(parsedData);
      }

      // Set warnings from the response
      if (data.stats.warnings.length > 0) {
        setWarnings(data.stats.warnings);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during preview');
      setPreviewData([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="panel-overlay">
      <div className="panel-content w-3/4 max-w-4xl max-h-[80vh] flex flex-col p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Transformation Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Source File Path (S3)
          </label>
          <input
            type="text"
            value={sourceFile}
            onChange={(e) => setSourceFile(e.target.value)}
            placeholder="e.g., data/input.csv"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Preview Limit (rows)
          </label>
          <input
            type="number"
            value={previewLimit}
            onChange={(e) => setPreviewLimit(Math.min(1000, Math.max(1, parseInt(e.target.value) || 100)))}
            min="1"
            max="1000"
            className="w-32 p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={handlePreview}
            disabled={isLoading}
            className={`primary-button ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Loading...' : 'Preview Transformation'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {warnings.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded">
            <h4 className="font-semibold mb-1">Warnings:</h4>
            <ul className="list-disc list-inside">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="overflow-auto flex-grow">
          <h3 className="text-md font-semibold mb-2">Preview Result:</h3>
          {previewData.length > 0 ? (
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  {Object.keys(previewData[0]).map((header) => (
                    <th key={header} className="border border-gray-300 px-4 py-2 text-left bg-gray-100">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((value, valueIndex) => (
                      <td key={valueIndex} className="border border-gray-300 px-4 py-2">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-gray-500 italic">
              No preview data available. Enter a source file path and click Preview.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel; 