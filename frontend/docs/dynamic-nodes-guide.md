# Dynamic Node System Guide

The Dynamic Node System allows you to define custom node layouts in JSON that can be loaded at runtime, making the application much more flexible and extensible.

## Overview

Instead of hard-coding every node type, you can now:
- Define nodes in JSON configuration files
- Load configurations at runtime
- Create nodes with dynamic inputs, outputs, and behaviors
- Store operation definitions for downstream processing
- **NEW**: Type-based handle coloring and connection validation

## JSON Node Configuration Format

Here's the structure of a node configuration:

```json
{
  "name": "String to Datetime",
  "description": "Convert a string to a datetime using a specified format",
  "category": "Data Transformation",
  "inputs": [
    {
      "name": "Date String Source",
      "type": "string",
      "description": "The string to convert to a datetime",
      "path": "operations.0.kwargs.converted_datetime_col.on.on.kwargs.name",
      "required": true
    },
    {
      "name": "Format",
      "type": "string", 
      "description": "The format of the datetime string",
      "path": "operations.0.kwargs.converted_datetime_col.on.kwargs.format",
      "default": "%Y-%m-%d %H:%M:%S"
    }
  ],
  "outputs": [
    {
      "name": "Converted Datetime",
      "type": "datetime",
      "description": "The converted datetime",
      "path": "operations.0.kwargs.converted_datetime_col.kwargs.name"
    }
  ],
  "operations": [
    {
      "operation": "with_columns",
      "kwargs": {
        "converted_datetime_col": {
          "expr": "alias",
          "on": {
            "expr": "str.to_datetime",
            "on": {
              "expr": "col",
              "kwargs": {
                "name": "date_string_source"
              }
            },
            "kwargs": {
              "format": "%Y-%m-%d %H:%M:%S"
            }
          },
          "kwargs": {
            "name": "parsed_datetime_output"
          }
        }
      }
    }
  ]
}
```

## Handle System & Type-Based Connections

### Automatic Handle Coloring
- **Each handle gets a unique color** based on its data type using a hash algorithm
- **String types** get one color, **datetime** another, **number** another, etc.
- **Unknown/no types** appear gray and can connect to anything
- **Consistent colors** across all nodes for the same type

### Connection Validation
- **Same types** can connect to each other
- **Compatible types** can connect (e.g., 'string' ↔ 'text', 'number' ↔ 'integer')  
- **Unknown/gray handles** can connect to anything
- **Invalid connections** are automatically prevented

### Handle Positioning
- Handles are positioned at the **actual edges** of nodes
- **No animations** - simple border color change on hover
- **Clean appearance** with proper spacing

## Configuration Fields

### Required Fields

- **name**: Display name for the node
- **description**: What the node does
- **inputs**: Array of input definitions
- **outputs**: Array of output definitions  
- **operations**: Array of operation definitions for downstream processing

### Optional Fields

- **category**: Group nodes by category in the context menu
- **version**: Version of the configuration
- **author**: Who created the configuration
- **icon**: Icon identifier (future use)

### Input/Output Fields

Each input and output must have:
- **name**: Display name
- **type**: Data type (string, number, datetime, etc.) - **determines handle color and connection compatibility**
- **description**: Help text
- **path**: JSONPath to where this value is used in operations

Additional input fields:
- **required**: Whether the input is required (default: false)
- **default**: Default value to use

### Supported Data Types

The system recognizes these base types and their aliases:
- **string** (aliases: text, varchar)
- **number** (aliases: integer, float, decimal)  
- **datetime** (aliases: date, timestamp)
- **boolean**
- **unknown** (gray handles, connects to anything)

You can use any type name - the system will generate a unique color for it.

## How It Works

1. **Configuration Loading**: JSON configurations are loaded via the `nodeConfigService`
2. **Node Creation**: When a user selects a dynamic node from the context menu, a `DynamicNode` component is created
3. **Runtime Rendering**: The `DynamicNode` component reads the configuration and renders:
   - Input fields with type-colored handles
   - Output handles with type-colored handles
   - Form controls for user input
4. **Connection Validation**: ReactFlow uses type checking to allow/prevent connections
5. **Data Storage**: User inputs are stored in the node data for later processing

## Using the System

### Loading Configurations

```typescript
import { nodeConfigService } from '../services/nodeConfigService';
import { loadConfigurationFromFile } from '../utils/configLoader';

// Load from JSON object
const configId = nodeConfigService.loadConfiguration(myNodeConfig);

// Load from file
const file = await loadConfigurationFromFile(jsonFile);

// Load multiple configurations
const configIds = nodeConfigService.loadConfigurationsFromArray(configs);
```

### Creating Dynamic Nodes

```typescript
import { createDynamicNode } from '../utils/nodeUtils';

// Create a node from a configuration ID
const node = createDynamicNode('string-to-datetime', { x: 100, y: 100 });
```

### Accessing Node Data

```typescript
import { isDynamicNode } from '../types/nodeConfig';

// Check if a node is dynamic
if (isDynamicNode(node.data)) {
  console.log('Config:', node.data.config);
  console.log('User inputs:', node.data.inputValues);
  console.log('Operations:', node.data.config.operations);
}
```

### Type-Based Connection Validation

```typescript
import { areTypesCompatible } from '../components/nodes/HandleStyles';

// Check if two types can connect
const canConnect = areTypesCompatible('string', 'text'); // true
const canConnect2 = areTypesCompatible('string', 'number'); // false
const canConnect3 = areTypesCompatible('unknown', 'anything'); // true
```

## Built-in Configurations

The system comes with several example configurations:

1. **String to Datetime**: Convert string to datetime with format specification
   - Input: `string` type (Date String Source)
   - Input: `string` type (Format)
   - Output: `datetime` type (Converted Datetime)

2. **String Concatenation**: Concatenate two strings with separator
   - Input: `string` type (First String)
   - Input: `string` type (Second String)  
   - Input: `string` type (Separator)
   - Output: `string` type (Concatenated String)

## Adding New Configurations

### Method 1: Code
Add configurations in `src/services/nodeConfigService.ts`:

```typescript
const myConfig = {
  name: "Number Addition",
  description: "Add two numbers together",
  category: "Math Operations",
  inputs: [
    {
      name: "First Number",
      type: "number",  // Will get a unique color
      description: "First number to add",
      path: "operations.0.kwargs.result.on.kwargs.left",
      required: true
    },
    {
      name: "Second Number", 
      type: "number",  // Same color as other number types
      description: "Second number to add",
      path: "operations.0.kwargs.result.on.kwargs.right", 
      required: true
    }
  ],
  outputs: [
    {
      name: "Sum",
      type: "number",  // Same color, can connect to number inputs
      description: "The sum of the two numbers",
      path: "operations.0.kwargs.result.kwargs.name"
    }
  ],
  operations: [...]
};

nodeConfigService.loadConfiguration(myConfig);
```

### Method 2: File Upload (Future)
The system includes utilities for loading from files that can be extended for file upload functionality.

### Method 3: Runtime API (Future) 
Load configurations from external APIs or services.

## Context Menu Integration

Dynamic nodes automatically appear in the context menu grouped by category:
- Basic nodes (legacy hard-coded nodes)
- Custom categories from configurations
- Each category shows the node name and description

## Development Tips

1. **Validation**: All configurations are validated before loading
2. **Error Handling**: Invalid configurations are logged and skipped
3. **Type Safety**: Use TypeScript interfaces for better development experience
4. **Debugging**: Enable development mode to see debug info in nodes
5. **Handle Colors**: Use consistent type names to get consistent handle colors
6. **Connection Testing**: Test connections between different type combinations

## Migration from Hard-coded Nodes

To migrate existing hard-coded nodes:

1. Create JSON configuration for the node
2. Define proper data types for inputs/outputs
3. Add it to the service initialization
4. Update any specific logic to work with dynamic data
5. Remove the old hard-coded component (optional)

The system supports both dynamic and legacy nodes simultaneously.

## Future Enhancements

- File-based configuration loading
- Visual configuration editor
- Configuration versioning and updates
- Validation improvements
- Enhanced type compatibility rules
- Custom UI components per input type
- **Type inference from connected nodes**
- **Visual type compatibility indicators** 