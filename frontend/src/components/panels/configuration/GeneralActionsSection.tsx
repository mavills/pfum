import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { 
  ChevronDown, 
  Settings,
  FolderOpen,
  Eye,
  Download,
  Upload
} from 'lucide-react';

interface GeneralActionsSectionProps {
  onPreviewTransformation: () => void;
  onExportConfig: () => void;
  onExportGraph: () => void;
  onImportGraphFromClipboard: () => void;
  onToggleS3Explorer: () => void;
  isS3ExplorerOpen: boolean;
}

const GeneralActionsSection: React.FC<GeneralActionsSectionProps> = ({
  onPreviewTransformation,
  onExportConfig,
  onExportGraph,
  onImportGraphFromClipboard,
  onToggleS3Explorer,
  isS3ExplorerOpen
}) => {
  return (
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
            onClick={onExportGraph}
          >
            <Upload size={14} />
            <span>Export Graph (New Tab)</span>
          </button>
          <button 
            className="config-action-button"
            onClick={onImportGraphFromClipboard}
          >
            <Download size={14} />
            <span>Import from Clipboard</span>
          </button>
          <button 
            className="config-action-button"
            onClick={onExportConfig}
            style={{ opacity: 0.7, fontSize: '11px' }}
          >
            <Download size={12} />
            <span>Export (Legacy)</span>
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
  );
};

export default GeneralActionsSection; 