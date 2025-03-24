"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { NodeProps as XYNodeProps, useEdges, Edge } from '@xyflow/react';
import { OutputNodeData, EntityType } from '../../types';
import NodeWrapper from './NodeWrapper';
import { handleColors } from './HandleStyles';
import { NodeDropdown, NodeTextInput } from './components';

// Define entity field configurations
const ENTITY_CONFIGS = {
  [EntityType.COURSES]: {
    label: "Courses",
    fields: [
      { id: "title", label: "Title" },
      { id: "description", label: "Description" },
      { id: "language", label: "Language" },
      { id: "external_id", label: "External ID" },
    ],
  },
  [EntityType.EMPLOYEES]: {
    label: "Employees",
    fields: [
      { id: "external_id", label: "External ID" },
      { id: "language", label: "Language" },
    ],
  },
};

// Convert enum to dropdown options
const entityTypeOptions = Object.values(EntityType).map(type => ({
  value: type,
  label: ENTITY_CONFIGS[type].label
}));

const OutputNode: React.FC<XYNodeProps> = ({ data, id }) => {
  const nodeData = data as OutputNodeData;
  const [entityType, setEntityType] = useState<EntityType>(
    nodeData?.entityType || EntityType.COURSES
  );
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(
    nodeData?.fieldValues || {}
  );
  const edges = useEdges();

  // Update node data when entity type changes
  const handleEntityTypeChange = useCallback((value: string) => {
    const newEntityType = value as EntityType;
    setEntityType(newEntityType);
    if (nodeData) {
      nodeData.entityType = newEntityType;
    }
  }, [nodeData]);

  // Update field value
  const handleFieldChange = useCallback((fieldId: string, value: string) => {
    setFieldValues(prev => {
      const newValues = { ...prev, [fieldId]: value };
      if (nodeData) {
        nodeData.fieldValues = newValues;
      }
      return newValues;
    });
  }, [nodeData]);

  // Check which fields are connected
  const getIsFieldConnected = useCallback((fieldId: string) => {
    return edges.some(
      (edge: Edge) => edge.target === id && edge.targetHandle === fieldId
    );
  }, [edges, id]);

  const entityConfig = ENTITY_CONFIGS[entityType];

  return (
    <NodeWrapper title="Output Node" headerColor={handleColors.output}>
      <div className="text-sm mb-3 text-gray-600">Entity Definition</div>

      <NodeDropdown
        label="Entity Type"
        value={entityType}
        options={entityTypeOptions}
        onChange={handleEntityTypeChange}
        className="mb-4"
        nodeType="output"
      />

      <div className="mb-2">
        <div className="node-field-label">Fields:</div>
        <div className="node-item-list space-y-2">
          {entityConfig.fields.map((field) => (
            <NodeTextInput
              key={`${id}-field-${field.id}`}
              label={field.label}
              value={fieldValues[field.id] || ''}
              onChange={(value) => handleFieldChange(field.id, value)}
              hasInput={true}
              inputHandleId={field.id}
              nodeType="output"
              isConnected={getIsFieldConnected(field.id)}
            />
          ))}
        </div>
      </div>
    </NodeWrapper>
  );
};

export default OutputNode;
