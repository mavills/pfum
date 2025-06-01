import { NodeConfiguration } from '../types/nodeConfig';

// In a real application, this would load from actual files or an API
// For now, we'll store configurations in memory and provide methods to add them

class NodeConfigService {
  private configurations: Map<string, NodeConfiguration> = new Map();
  
  // Load a configuration (in a real app, this might read from disk or API)
  loadConfiguration(config: NodeConfiguration): string {
    const id = this.generateConfigId(config.name);
    this.configurations.set(id, config);
    return id;
  }
  
  // Get a configuration by ID
  getConfiguration(id: string): NodeConfiguration | undefined {
    return this.configurations.get(id);
  }
  
  // Get all configurations
  getAllConfigurations(): Array<{ id: string; config: NodeConfiguration }> {
    return Array.from(this.configurations.entries()).map(([id, config]) => ({ id, config }));
  }
  
  // Get configurations by category
  getConfigurationsByCategory(category?: string): Array<{ id: string; config: NodeConfiguration }> {
    return this.getAllConfigurations().filter(({ config }) => 
      !category || config.category === category
    );
  }
  
  // Remove a configuration
  removeConfiguration(id: string): boolean {
    return this.configurations.delete(id);
  }
  
  // Generate a unique ID for a configuration
  private generateConfigId(name: string): string {
    const baseId = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let id = baseId;
    let counter = 1;
    
    while (this.configurations.has(id)) {
      id = `${baseId}-${counter}`;
      counter++;
    }
    
    return id;
  }
  
  // Load configurations from JSON array (useful for bulk loading)
  loadConfigurationsFromArray(configs: NodeConfiguration[]): string[] {
    return configs.map(config => this.loadConfiguration(config));
  }
  
  // Export all configurations as JSON
  exportConfigurations(): NodeConfiguration[] {
    return Array.from(this.configurations.values());
  }
}

// Create a singleton instance
export const nodeConfigService = new NodeConfigService();

// Initialize with some default configurations
export function initializeDefaultConfigurations() {
  // Example: String to Datetime node configuration
  const stringToDatetimeConfig: NodeConfiguration = {
    name: "String to Datetime",
    description: "Convert a string to a datetime using a specified format",
    category: "Data Transformation",
    inputs: [
      {
        name: "Date String Source",
        type: "string",
        description: "The string to convert to a datetime",
        path: "operations.0.kwargs.converted_datetime_col.on.on.kwargs.name",
        required: true
      },
      {
        name: "Format",
        type: "string",
        description: "The format of the datetime string",
        path: "operations.0.kwargs.converted_datetime_col.on.kwargs.format",
        default: "%Y-%m-%d %H:%M:%S"
      }
    ],
    outputs: [
      {
        name: "Converted Datetime",
        type: "datetime",
        description: "The converted datetime",
        path: "operations.0.kwargs.converted_datetime_col.kwargs.name"
      }
    ],
    operations: [
      {
        operation: "with_columns",
        kwargs: {
          converted_datetime_col: {
            expr: "alias",
            on: {
              expr: "str.to_datetime",
              on: {
                expr: "col",
                kwargs: {
                  name: "date_string_source"
                }
              },
              kwargs: {
                format: "%Y-%m-%d %H:%M:%S"
              }
            },
            kwargs: {
              name: "parsed_datetime_output"
            }
          }
        }
      }
    ]
  };
  
  // Example: String Concatenation node
  const stringConcatConfig: NodeConfiguration = {
    name: "String Concatenation",
    description: "Concatenate two strings with a separator",
    category: "String Operations",
    inputs: [
      {
        name: "First String",
        type: "string",
        description: "The first string to concatenate",
        path: "operations.0.kwargs.result_col.on.kwargs.exprs.0.kwargs.name",
        required: true
      },
      {
        name: "Second String", 
        type: "string",
        description: "The second string to concatenate",
        path: "operations.0.kwargs.result_col.on.kwargs.exprs.1.kwargs.name",
        required: true
      },
      {
        name: "Separator",
        type: "string",
        description: "Separator between strings",
        path: "operations.0.kwargs.result_col.on.kwargs.separator",
        default: "_"
      }
    ],
    outputs: [
      {
        name: "Concatenated String",
        type: "string", 
        description: "The result of concatenation",
        path: "operations.0.kwargs.result_col.kwargs.name"
      }
    ],
    operations: [
      {
        operation: "with_columns",
        kwargs: {
          result_col: {
            expr: "alias",
            on: {
              expr: "concat_str",
              kwargs: {
                exprs: [
                  { expr: "col", kwargs: { name: "first_string" } },
                  { expr: "col", kwargs: { name: "second_string" } }
                ],
                separator: "_"
              }
            },
            kwargs: {
              name: "concatenated_result"
            }
          }
        }
      }
    ]
  };
  
  nodeConfigService.loadConfiguration(stringToDatetimeConfig);
  nodeConfigService.loadConfiguration(stringConcatConfig);
}

export default nodeConfigService; 