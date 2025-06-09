"use client";

import React, { useState, useEffect } from "react";
import { CustomNode, CustomEdge } from "../../types";
import { generateGraphExportJSON } from "../../services/serialization/exportUtils";

interface ExportConfigPanelProps {
  nodes: CustomNode[];
  edges: CustomEdge[];
  isOpen: boolean;
  onClose: () => void;
}

const ExportConfigPanel: React.FC<ExportConfigPanelProps> = ({
  nodes,
  edges,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [formattedJSON, setFormattedJSON] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      const configJSON = generateGraphExportJSON(nodes, edges);
      // Apply basic syntax highlighting
      const highlighted = configJSON
        .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
        .replace(
          /"([^"]+)"(?=[,\s\n])/g,
          '<span class="json-string">"$1"</span>'
        )
        .replace(/: (\d+)([,\s\n])/g, ': <span class="json-number">$1</span>$2')
        .replace(
          /: (true|false)([,\s\n])/g,
          ': <span class="json-boolean">$1</span>$2'
        )
        .replace(/: (null)([,\s\n])/g, ': <span class="json-null">$1</span>$2');

      setFormattedJSON(highlighted);
    }
  }, [isOpen, nodes, edges]);

  if (!isOpen) return null;

  const rawConfigJSON = generateGraphExportJSON(nodes, edges);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawConfigJSON);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([rawConfigJSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transformation-config.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="panel-overlay">
      <div className="panel-content w-3/4 max-w-4xl max-h-[80vh] flex flex-col p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Export Configuration</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            onClick={handleCopy}
            className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
          >
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>
          <button
            onClick={handleDownload}
            className="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 transition-colors"
          >
            Download JSON
          </button>
        </div>

        <div className="overflow-auto flex-grow bg-gray-50 p-4 rounded border border-gray-300 export-config-panel">
          <pre
            className="font-mono whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: formattedJSON }}
          />
        </div>
      </div>
    </div>
  );
};

export default ExportConfigPanel;
