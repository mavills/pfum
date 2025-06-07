import { NodeConfiguration } from "../types/nodeConfig";

// Simple event emitter for configuration changes
type ConfigurationEventListener = () => void;

// In a real application, this would load from actual files or an API
// For now, we'll store configurations in memory and provide methods to add them

class NodeConfigService {
  private configurations: Map<string, NodeConfiguration> = new Map();
  private listeners: ConfigurationEventListener[] = [];

  // Add event listener for configuration changes
  addListener(listener: ConfigurationEventListener): void {
    this.listeners.push(listener);
  }

  // Remove event listener
  removeListener(listener: ConfigurationEventListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // Notify all listeners of configuration changes
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  // Load a configuration (in a real app, this might read from disk or API)
  loadConfiguration(config: NodeConfiguration): string {
    const id = this.generateConfigId(config.name);
    this.configurations.set(id, config);
    this.notifyListeners(); // Notify listeners of the change
    return id;
  }

  // Get a configuration by ID
  getConfiguration(id: string): NodeConfiguration | undefined {
    return this.configurations.get(id);
  }

  // Get all configurations
  getAllConfigurations(): Array<{ id: string; config: NodeConfiguration }> {
    return Array.from(this.configurations.entries()).map(([id, config]) => ({
      id,
      config,
    }));
  }

  // Get configurations by category
  getConfigurationsByCategory(
    category?: string
  ): Array<{ id: string; config: NodeConfiguration }> {
    return this.getAllConfigurations().filter(
      ({ config }) => !category || config.category === category
    );
  }

  // Generate a unique ID for a configuration
  private generateConfigId(name: string): string {
    const baseId = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    let id = baseId;
    let counter = 1;

    while (this.configurations.has(id)) {
      id = `${baseId}-${counter}`;
      counter++;
    }

    return id;
  }
}

// Create a singleton instance
export const nodeConfigService = new NodeConfigService();

export default nodeConfigService;
