# Dynamic Node Configurations

This directory contains JSON configuration files that define dynamic nodes for the application. The system automatically loads all configurations listed in `manifest.json` at startup.

## Quick Start

1. **Create a new JSON file** in this directory (e.g., `my-custom-node.json`)
2. **Add it to `manifest.json`** in the configurations array
3. **Refresh the application** - your new node will appear in the sidebar!

## File Structure

```
public/configs/
├── README.md                    # This file
├── manifest.json               # Lists all available configurations
├── string-to-datetime.json     # Example: Data transformation
├── string-concatenation.json   # Example: String operations
├── math-addition.json          # Example: Math operations
├── example-template.json       # Template for new nodes
└── your-custom-node.json       # Your custom configurations
```

## Adding a New Configuration

### Step 1: Create the JSON File

Create a new `.json` file in this directory. Use `example-template.json` as a starting point:

```json
{
  "name": "Your Node Name",
  "description": "What your node does",
  "category": "Your Category",
  "inputs": [
    {
      "name": "Input Name",
      "type": "string",  // string, number, datetime, boolean, etc.
      "description": "Help text for this input",
      "path": "operations.0.kwargs.input_path",
      "required": true,   // optional
      "default": "value"  // optional
    }
  ],
  "outputs": [
    {
      "name": "Output Name", 
      "type": "string",
      "description": "Help text for this output",
      "path": "operations.0.kwargs.output_path"
    }
  ],
  "operations": [
    {
      "operation": "your_operation",
      "kwargs": {
        // Your operation parameters
      }
    }
  ]
}
```

### Step 2: Update the Manifest

Add your new configuration to `manifest.json`:

```json
{
  "version": "1.0.0",
  "configurations": [
    // ... existing configurations ...
    {
      "id": "your-node-id",
      "file": "your-custom-node.json",
      "name": "Your Node Name",
      "category": "Your Category", 
      "description": "What your node does"
    }
  ]
}
```

### Step 3: Refresh the Application

The application will automatically load your new configuration and it will appear in the sidebar under your specified category.

## Configuration Fields

### Required Fields

- **name**: Display name for the node
- **description**: What the node does  
- **inputs**: Array of input definitions
- **outputs**: Array of output definitions
- **operations**: Array of operation definitions

### Optional Fields

- **category**: Groups nodes in the sidebar (default: "Custom Nodes")
- **version**: Version of your configuration
- **author**: Who created this configuration

### Input/Output Fields

Each input and output needs:

- **name**: Display name
- **type**: Data type (determines handle color and connection compatibility)
- **description**: Help text shown to users
- **path**: JSONPath where this value is used in operations

Additional input fields:
- **required**: Whether input is required (default: false)
- **default**: Default value to use

## Data Types & Handle Colors

The system automatically assigns colors to handles based on data type:

- **string**: Text, varchar (one color)
- **number**: Integer, float, decimal (another color)  
- **datetime**: Date, timestamp (another color)
- **boolean**: True/false values (another color)
- **custom**: Any custom type gets its own unique color

## Handle Connections

- **Same types** can connect (string → string)
- **Compatible types** can connect (string → text) 
- **Gray handles** (unknown type) connect to anything
- **Different types** are blocked automatically

## Examples

### Simple Text Processor

```json
{
  "name": "Text Uppercase",
  "description": "Convert text to uppercase",
  "category": "Text Processing",
  "inputs": [
    {
      "name": "Text Input",
      "type": "string",
      "description": "Text to convert to uppercase",
      "path": "operations.0.kwargs.text_col.on.kwargs.input",
      "required": true
    }
  ],
  "outputs": [
    {
      "name": "Uppercase Text",
      "type": "string", 
      "description": "The uppercase text",
      "path": "operations.0.kwargs.text_col.kwargs.name"
    }
  ],
  "operations": [
    {
      "operation": "with_columns",
      "kwargs": {
        "text_col": {
          "expr": "alias",
          "on": {
            "expr": "str.to_uppercase",
            "on": {
              "expr": "col",
              "kwargs": { "name": "input_text" }
            }
          },
          "kwargs": { "name": "uppercase_result" }
        }
      }
    }
  ]
}
```

### Math Operations

```json
{
  "name": "Math Multiply",
  "description": "Multiply two numbers",
  "category": "Math Operations", 
  "inputs": [
    {
      "name": "First Number",
      "type": "number",
      "description": "First number to multiply",
      "path": "operations.0.kwargs.result.on.kwargs.left",
      "required": true
    },
    {
      "name": "Second Number",
      "type": "number", 
      "description": "Second number to multiply", 
      "path": "operations.0.kwargs.result.on.kwargs.right",
      "required": true
    }
  ],
  "outputs": [
    {
      "name": "Product",
      "type": "number",
      "description": "The multiplication result", 
      "path": "operations.0.kwargs.result.kwargs.name"
    }
  ],
  "operations": [
    {
      "operation": "with_columns",
      "kwargs": {
        "result": {
          "expr": "alias",
          "on": {
            "expr": "multiply",
            "kwargs": {
              "left": { "expr": "col", "kwargs": { "name": "first_number" } },
              "right": { "expr": "col", "kwargs": { "name": "second_number" } }
            }
          },
          "kwargs": { "name": "multiply_result" }
        }
      }
    }
  ]
}
```

## Troubleshooting

### Configuration Not Loading?

1. Check the browser console for error messages
2. Verify your JSON is valid (use a JSON validator)
3. Make sure the file is listed in `manifest.json`
4. Ensure all required fields are present

### Node Not Appearing in Sidebar?

1. Check if the configuration loaded successfully (console logs)
2. Verify the category name is spelled correctly
3. Try refreshing the application

### Connection Issues?

1. Check that input/output types are compatible
2. Verify the `type` field matches between connected nodes
3. Use consistent type names across configurations

## Tips for Experimentation

1. **Start Simple**: Copy `example-template.json` and modify it gradually
2. **Use Console**: Check browser console for loading status and errors
3. **Test Connections**: Create nodes with different types to see connection validation
4. **Iterate Quickly**: Just save the JSON file and refresh - no rebuild needed!
5. **Backup**: Keep copies of working configurations before making changes

Happy experimenting! 🚀 