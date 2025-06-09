import React, { useState, useEffect, useCallback } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown, Sparkles, RefreshCw } from "lucide-react";
import { nodeConfigService } from "../../../services/nodeConfigService";
import DraggableNode from "./DraggableNode";
import { operatorPubSub } from "@/services/templating/pubsub";
import manualInputOperator from "@/services/templating/manualInputOperator";

interface AddNodeMenuProps {}

const AddNodeMenu: React.FC<AddNodeMenuProps> = ({}) => {
  const [operators, setOperators] = useState(() =>
    operatorPubSub.getAllConfigurations()
  );
  const [configsLoaded, setConfigsLoaded] = useState(false);

  // Refresh configurations from the service
  const refreshConfigurations = useCallback(() => {
    const operators = operatorPubSub.getAllConfigurations();
    setOperators(operators);
    setConfigsLoaded(true);
  }, []);

  // Listen for configuration changes
  useEffect(() => {
    // Initial load
    refreshConfigurations();

    // Set up listener for configuration changes
    const handleConfigurationChange = () => {
      refreshConfigurations();
    };

    nodeConfigService.addListener(handleConfigurationChange);

    // Cleanup listener on unmount
    return () => {
      nodeConfigService.removeListener(handleConfigurationChange);
    };
  }, [refreshConfigurations]);

  return (
    <Accordion.Item value="nodes" className="config-accordion-item">
      <Accordion.Trigger className="config-accordion-trigger">
        <Sparkles size={16} />
        <span>Add Nodes</span>
        <span className="config-node-count">({operators.length} dynamic)</span>
        <ChevronDown size={14} className="config-accordion-chevron" />
      </Accordion.Trigger>
      <Accordion.Content className="config-accordion-content">
        <div className="config-section-content">
          {/* Configuration Status & Refresh */}
          <div className="config-status-bar">
            <div className="config-status-info">
              <span className="config-status-text">
                {configsLoaded
                  ? `${operators.length} operators loaded`
                  : "Loading operators..."}
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
              <DraggableNode operator={manualInputOperator} />
            </div>
          </div>

          {/* Operators */}
          {Object.keys(operators).length === 0 ? (
            <div className="config-empty-state">
              No operators loaded yet.
              <br />
              <small>
                Operators should load automatically from /operators/
              </small>
            </div>
          ) : (
            operators.map(({ operator }) => (
              <div className="config-subsection" key={operator.id}>
                <div className="config-subsection-title">
                  {operator.category} ({operator.title})
                </div>

                <DraggableNode operator={operator} />
              </div>
            ))
          )}
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default AddNodeMenu;
