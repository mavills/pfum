# Graph Export Strategy

## Overview

This document outlines the refactored export strategy for the CSV transformation application, which enables users to export their complete graph structure for downstream processing and API consumption.

## New Export Strategy (Version 2.0)

### Key Features

1. **Complete Node Integrity**: Preserves full node configurations alongside instance data
2. **Clean Edge Structure**: Simple source/target mapping for downstream processing
3. **New Tab Export**: Opens export in a new tab for easy copying and inspection
4. **API-Ready Format**: Structured for downstream API consumption and validation

### Export Structure

```typescript
interface GraphExport {
  version: "2.0";
  metadata: {
    exported_at: string;
    node_count: number;
    edge_count: number;
    export_format: "graph";
  };
  nodes: NodeExport[];
  edges: EdgeExport[];
}

interface NodeExport {
  id: string;
  position: { x: number; y: number };
  type: "input" | "dynamic" | "unknown";
  configuration: NodeConfiguration; // Full config preserved
  instance_data: {
    // Node-specific user data
    inputValues?: Record<string, any>;
    column_names?: string[];
    source_file?: string;
    nodeConfigId?: string;
    configName?: string;
  };
}

interface EdgeExport {
  id: string;
  source: {
    node_id: string;
    output_handle: string;
  };
  target: {
    node_id: string;
    input_handle: string;
  };
}
```

### Node Types

#### Input Nodes
- **Type**: `"input"`
- **Configuration**: Auto-generated configuration based on column structure
- **Instance Data**: `column_names`, `source_file`
- **Operations**: Includes `read_csv` operation with file path and columns

#### Dynamic Nodes
- **Type**: `"dynamic"`
- **Configuration**: Full JSON configuration from original config files
- **Instance Data**: `nodeConfigId`, `configName`, `inputValues`
- **Operations**: Original operations from configuration preserved

### Export Flow

1. **User Clicks Export**: From Configuration Panel → "Export Graph (New Tab)"
2. **Data Generation**: `generateGraphExportJSON()` processes nodes and edges
3. **Storage**: Export data stored in `sessionStorage`
4. **New Tab**: Opens `/export` page in new browser tab
5. **Display**: Clean interface for copying, downloading, and inspecting JSON

### Usage

#### Exporting a Graph
```typescript
// In the main application
const exportData = generateGraphExportJSON(nodes, edges);
sessionStorage.setItem('graph-export-data', exportData);
window.open('/export', '_blank');
```

#### Consuming the Export
```typescript
// Example downstream API consumption
const response = await fetch('/api/process-graph', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: exportData
});
```

### Export Page Features

- **Clean Interface**: Minimal design focused on JSON inspection
- **Copy to Clipboard**: One-click copying of entire JSON
- **Download**: Save as `.json` file with timestamp
- **Metadata Display**: Shows export info (date, node/edge counts)
- **Syntax Highlighting**: Dark theme code display
- **Format Information**: Documentation about the export structure

### Backward Compatibility

- **Legacy Export Modal**: Still available as "Legacy Export Modal" button
- **Old Format Support**: `generateConfigJSON()` maintained for compatibility
- **Validation Functions**: Both old and new validation functions available

### Benefits

1. **Complete Integrity**: Full node configurations preserved for accurate reconstruction
2. **Clean Structure**: Simplified edge mapping for easier downstream processing
3. **API Ready**: Format designed for API consumption and validation
4. **User Friendly**: New tab interface doesn't interrupt workflow
5. **Future Proof**: Version field allows for format evolution

### Future Enhancements

1. **API Integration**: Direct posting to configurable API endpoints
2. **Import Functionality**: Ability to import and reconstruct graphs
3. **Format Versioning**: Support for multiple export format versions
4. **Validation**: Real-time validation of export structure
5. **Compression**: Optional compression for large graphs

## Implementation Details

### Files Modified

- `src/utils/exportUtils.ts`: Refactored export logic with new format
- `src/app/export/page.tsx`: New export page component
- `src/components/TransformationFlow.tsx`: Added new export function
- `src/components/panels/ConfigurationPanel.tsx`: Updated export buttons

### Key Functions

- `generateGraphExportJSON()`: Main export function
- `createNodeExport()`: Processes individual nodes with full integrity
- `createEdgeExport()`: Creates clean edge mappings
- `validateGraphExportJSON()`: Validates export structure

This new export strategy provides a robust foundation for graph sharing, API integration, and downstream processing while maintaining the integrity of the original node configurations. 