import React, { useState, useEffect, useCallback } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { 
  ChevronDown, 
  FileInput,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { NodeType } from '../../../types';
import { nodeConfigService } from '../../../services/nodeConfigService';
import DraggableNode from './DraggableNode';

interface DynamicNodesSectionProps {
  onAddNode: (type: NodeType, position: { x: number; y: number }) => void;
  onAddDynamicNode: (configId: string, position: { x: number; y: number }) => void;
}

const DynamicNodesSection: React.FC<DynamicNodesSectionProps> = ({
  onAddNode,
  onAddDynamicNode
}) => {
  // Dynamic configurations state - force re-render when configurations change
  const [dynamicConfigs, setDynamicConfigs] = useState(() => nodeConfigService.getAllConfigurations());
  const [configsLoaded, setConfigsLoaded] = useState(false);

  // Refresh configurations from the service
  const refreshConfigurations = useCallback(() => {
    const configs = nodeConfigService.getAllConfigurations();
    setDynamicConfigs(configs);
    setConfigsLoaded(true);
    console.log('🔄 [CONFIG-PANEL] Refreshed configurations:', configs.length);
  }, []);

  // Listen for configuration changes
  useEffect(() => {
    // Initial load
    refreshConfigurations();
    
    // Set up listener for configuration changes
    const handleConfigurationChange = () => {
      console.log('📡 [CONFIG-PANEL] Configuration change detected, updating...');
      refreshConfigurations();
    };
    
    nodeConfigService.addListener(handleConfigurationChange);
    
    // Cleanup listener on unmount
    return () => {
      nodeConfigService.removeListener(handleConfigurationChange);
    };
  }, [refreshConfigurations]);
  
  // Group dynamic configurations by category
  const dynamicCategories = dynamicConfigs.reduce((acc, { id, config }) => {
    const category = config.category || 'Custom Nodes';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ id, config });
    return acc;
  }, {} as Record<string, Array<{ id: string; config: { name: string; description?: string; category?: string } }>>);

  return (
    <Accordion.Item value="nodes" className="config-accordion-item">
      <Accordion.Trigger className="config-accordion-trigger">
        <Sparkles size={16} />
        <span>Add Nodes</span>
        <span className="config-node-count">({dynamicConfigs.length} dynamic)</span>
        <ChevronDown size={14} className="config-accordion-chevron" />
      </Accordion.Trigger>
      <Accordion.Content className="config-accordion-content">
        <div className="config-section-content">
          
          {/* Configuration Status & Refresh */}
          <div className="config-status-bar">
            <div className="config-status-info">
              <span className="config-status-text">
                {configsLoaded ? `${dynamicConfigs.length} configurations loaded` : 'Loading configurations...'}
              </span>
            </div>
            <button 
              className="config-refresh-button"
              onClick={refreshConfigurations}
              title="Refresh configurations"
            >
              <RefreshCw size={12} />
            </button>
          </div>
          
          {/* Input Nodes */}
          <div className="config-subsection">
            <div className="config-subsection-title">Input</div>
            <div className="config-node-list">
              <DraggableNode
                type="basic"
                nodeType={NodeType.INPUT}
                title="CSV Input"
                description="Define CSV column structure manually"
                icon={<FileInput size={14} />}
                onAddNode={onAddNode}
                onAddDynamicNode={onAddDynamicNode}
              />
            </div>
          </div>
          
          {/* Dynamic Node Categories */}
          {Object.keys(dynamicCategories).length === 0 ? (
            <div className="config-empty-state">
              No dynamic configurations loaded yet.
              <br />
              <small>Configurations should load automatically from /configs/</small>
            </div>
          ) : (
            Object.entries(dynamicCategories).map(([categoryName, configs]) => (
              <div key={categoryName} className="config-subsection">
                <div className="config-subsection-title">{categoryName} ({configs.length})</div>
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
            ))
          )}
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default DynamicNodesSection; 