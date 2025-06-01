# Import/Export Workflow

## Overview

The CSV transformation application now supports a complete import/export workflow that allows you to:

1. **Export** your graph to JSON format (opens in new tab)
2. **Import** a graph from JSON via clipboard
3. **Share** configurations between sessions or team members

## How to Use

### Exporting a Graph

1. Create your transformation graph with input nodes, transformation nodes, and connections
2. Click **"Export Graph (New Tab)"** in the Configuration Panel
3. A new tab opens with:
   - Formatted JSON configuration
   - Copy to clipboard button
   - Download as file option
   - Metadata about the export (timestamp, node count, edge count)

### Importing a Graph

1. Copy a valid graph JSON to your clipboard (from export tab or elsewhere)
2. Click **"Import from Clipboard"** in the Configuration Panel  
3. The application will:
   - Read from your clipboard
   - Validate the JSON format
   - Clear the current graph
   - Import all nodes and edges
   - Restore all connections and configurations

### Testing the Workflow

To test the complete round-trip:

1. **Create a sample graph:**
   - Add an Input node (from S3 or manual)
   - Add some transformation nodes (e.g., String Concatenation, Math Addition)
   - Connect them with edges
   - Configure input values on dynamic nodes

2. **Export the graph:**
   - Click "Export Graph (New Tab)"
   - Copy the JSON from the export page

3. **Clear and import:**
   - Go back to the main application
   - Delete all nodes (or refresh the page)
   - Click "Import from Clipboard"
   - Verify everything is restored exactly as before

## JSON Structure

The export format preserves:

- **Complete node configurations** (types, inputs, outputs, operations)
- **Instance-specific data** (positions, user input values, IDs)
- **All edge connections** with proper handle mapping
- **Metadata** (export timestamp, counts, format version)

## Error Handling

The import process includes validation for:

- ✅ Valid JSON format
- ✅ Required fields (nodes, edges, metadata)
- ✅ Node type compatibility
- ✅ Edge reference integrity
- ❌ Displays clear error messages for invalid data

## Use Cases

- **Session backup:** Export before major changes, import to restore
- **Team collaboration:** Share working configurations via JSON
- **Template creation:** Export common patterns for reuse
- **API integration:** Send graphs to backend for processing/validation
- **Version control:** Store graph configurations in git repositories

## Browser Compatibility

- **Clipboard API** required for import functionality
- Works in modern browsers (Chrome 66+, Firefox 63+, Safari 13.1+)
- Fallback error message shown for unsupported browsers 