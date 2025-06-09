"use client";

import React from "react";
import * as Accordion from "@radix-ui/react-accordion";
import GeneralActionsSection from "./GeneralActionsSection";
import AddNodeMenu from "./AddNodeMenu";
import S3Explorer from "./S3Explorer";
import { NodeType } from "../../../types";

export interface ConfigurationPanelProps {
  onAddInputNodeFromS3: (columnNames: string[], sourceFile: string) => void;
  onPreviewTransformation: () => void;
  onExportConfig: () => void;
  onExportGraph: () => void;
  onImportGraphFromClipboard: () => void;
  onToggleS3Explorer: () => void;
  isS3ExplorerOpen: boolean;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  onAddInputNodeFromS3,
  onPreviewTransformation,
  onExportConfig,
  onExportGraph,
  onImportGraphFromClipboard,
  onToggleS3Explorer,
  isS3ExplorerOpen,
}) => {
  return (
    <div className="config-panel">
      <div className="config-panel-header">
        <h2 className="config-panel-title">Configuration</h2>
      </div>

      <div className="config-panel-content">
        <Accordion.Root
          type="multiple"
          defaultValue={["general", "nodes"]}
          className="config-accordion"
        >
          {/* General Settings */}
          <GeneralActionsSection
            onPreviewTransformation={onPreviewTransformation}
            onExportConfig={onExportConfig}
            onExportGraph={onExportGraph}
            onImportGraphFromClipboard={onImportGraphFromClipboard}
            onToggleS3Explorer={onToggleS3Explorer}
            isS3ExplorerOpen={isS3ExplorerOpen}
          />

          {/* Add Nodes */}
          <AddNodeMenu />

          {/* File Settings (S3 Explorer) */}
          {isS3ExplorerOpen && (
            <S3Explorer onAddInputNodeFromS3={onAddInputNodeFromS3} />
          )}
        </Accordion.Root>
      </div>
    </div>
  );
};

export default ConfigurationPanel;
