import { NodeConfiguration } from '../types/nodeConfig';
import { nodeConfigService } from '../services/nodeConfigService';

/**
 * Load node configurations from JSON files or configuration objects.
 * In a real application, this could read from:
 * - Local JSON files in a configs directory
 * - A remote API
 * - A configuration database
 * - Environment variables or build-time configuration
 */

// Example function to load from a JSON file (client-side)
export async function loadConfigurationFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        const config: NodeConfiguration = JSON.parse(jsonString);
        
        // Validate the configuration
        if (!isValidNodeConfiguration(config)) {
          reject(new Error('Invalid node configuration format'));
          return;
        }
        
        const configId = nodeConfigService.loadConfiguration(config);
        resolve(configId);
      } catch (error) {
        reject(new Error(`Failed to parse configuration: ${error}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Load configuration from a URL (fetch)
export async function loadConfigurationFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const config: NodeConfiguration = await response.json();
    
    if (!isValidNodeConfiguration(config)) {
      throw new Error('Invalid node configuration format');
    }
    
    return nodeConfigService.loadConfiguration(config);
  } catch (error) {
    throw new Error(`Failed to load configuration from URL: ${error}`);
  }
}

// Load configuration from raw JSON object
export function loadConfigurationFromObject(config: NodeConfiguration): string {
  if (!isValidNodeConfiguration(config)) {
    throw new Error('Invalid node configuration format');
  }
  
  return nodeConfigService.loadConfiguration(config);
}

// Load multiple configurations from an array
export function loadConfigurationsFromArray(configs: NodeConfiguration[]): string[] {
  const configIds: string[] = [];
  
  for (const config of configs) {
    if (!isValidNodeConfiguration(config)) {
      const configName = (config as any)?.name || 'unknown';
      console.warn(`Skipping invalid configuration: ${configName}`);
      continue;
    }
    
    try {
      const configId = nodeConfigService.loadConfiguration(config);
      configIds.push(configId);
    } catch (error) {
      console.warn(`Failed to load configuration "${config.name}":`, error);
    }
  }
  
  return configIds;
}

// Basic validation for node configuration
function isValidNodeConfiguration(config: any): config is NodeConfiguration {
  if (!config || typeof config !== 'object') {
    return false;
  }
  
  // Check required fields
  if (!config.name || typeof config.name !== 'string') {
    return false;
  }
  
  if (!config.description || typeof config.description !== 'string') {
    return false;
  }
  
  if (!Array.isArray(config.inputs)) {
    return false;
  }
  
  if (!Array.isArray(config.outputs)) {
    return false;
  }
  
  if (!Array.isArray(config.operations)) {
    return false;
  }
  
  // Validate inputs
  for (const input of config.inputs) {
    if (!input.name || !input.type || !input.path) {
      return false;
    }
  }
  
  // Validate outputs
  for (const output of config.outputs) {
    if (!output.name || !output.type || !output.path) {
      return false;
    }
  }
  
  return true;
}

// Export configurations to JSON
export function exportConfigurations(): NodeConfiguration[] {
  return nodeConfigService.exportConfigurations();
}

// Helper to create a downloadable JSON file of all configurations
export function downloadConfigurationsAsJson(): void {
  const configs = exportConfigurations();
  const jsonString = JSON.stringify(configs, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'node-configurations.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
} 