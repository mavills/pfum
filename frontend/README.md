# Transformat

Transformat is a visual node-based editor for configuring CSV transformations. It allows you to create transformation flows that convert CSV data into standardized formats.

## Features

- Visual node editor built with Reactflow (xyflow)
- Right-click context menu for adding nodes (similar to Blender)
- Three types of nodes:
  - **Input Node**: Configurable outputs representing CSV columns
  - **Output Node**: Configurable entity types with corresponding inputs
  - **String Concatenation Node**: Joins two string inputs with a configurable separator
- Preview functionality for testing transformations

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. **Adding Nodes**: Right-click on the canvas to open the context menu, then select the type of node you want to add.

2. **Input Node**: Add column names to create outputs that represent your CSV columns.

3. **Output Node**: Select an entity type (e.g., "Courses") which determines the required inputs.

4. **String Concatenation Node**: Configure the separator character used to join two strings.

5. **Connecting Nodes**: Click and drag from an output handle to an input handle to create connections.

6. **Preview**: Click the "Preview Transformation" button to test your transformation with sample CSV data.

## Future Enhancements

- Additional transformation node types
- Import/export of transformation configurations
- Direct CSV file upload and download
- Actual transformation execution
- More entity types and custom entity creation

## License

This project is licensed under the MIT License.
