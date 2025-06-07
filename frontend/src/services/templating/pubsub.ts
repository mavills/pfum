import { Operator } from "./operatorType";

// Simple event emitter for configuration changes
type ConfigurationEventListener = () => void;

class OperatorPubSub {
  private operators: Map<string, Operator> = new Map();
  private listeners: ConfigurationEventListener[] = [];

  // Add event listener for configuration changes
  addListener(listener: ConfigurationEventListener): void {
    const index = this.listeners.indexOf(listener);
    if (index === -1) {
      this.listeners.push(listener);
    }
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
  loadConfigurations(operators: Operator[]): void {
    for (const operator of operators) {
      this.operators.set(operator.id, operator);
    }
    this.notifyListeners(); // Notify listeners of the change
  }

  // Get a configuration by ID
  getConfiguration(id: string): Operator | undefined {
    return this.operators.get(id);
  }

  // Get all configurations
  getAllConfigurations(): Array<{ id: string; operator: Operator }> {
    return Array.from(this.operators.entries()).map(([id, operator]) => ({
      id,
      operator,
    }));
  }
}

// Create a singleton instance
export const operatorPubSub = new OperatorPubSub();

export default operatorPubSub;
