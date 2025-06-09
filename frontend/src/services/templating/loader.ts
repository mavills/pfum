import { Operator } from "./operatorType";
import { operatorPubSub } from "./pubsub";

/**
 * Fetches and returns the list of configuration file paths from the manifest
 * @returns Promise resolving to array of configuration file paths
 */
async function listOperators(): Promise<string[]> {
  const manifestResponse = await fetch("/operators/manifest.json");

  if (!manifestResponse.ok) {
    throw new Error(`Failed to load manifest: ${manifestResponse.status}`);
  }

  const manifest = await manifestResponse.json();
  const operatorLocations: string[] = [];

  for (const operatorInfo of manifest.operators) {
    operatorLocations.push(`/operators/${operatorInfo.file}`);
  }

  return operatorLocations;
}

async function loadOperator(configLocation: string): Promise<Operator> {
  const configResponse = await fetch(configLocation);
  if (!configResponse.ok) {
    throw new Error(`Failed to load config: ${configResponse.status}`);
  }
  return configResponse.json();
}

export async function getAllOperators(): Promise<Operator[]> {
  const operatorLocations = await listOperators();
  const operators = await Promise.all(operatorLocations.map(loadOperator));
  return operators;
}

export async function initializeDefaultOperators(): Promise<void> {
  const operators = await getAllOperators();
  operatorPubSub.loadConfigurations(operators);
}

// Example function to load from a JSON file (client-side)
// export async function loadConfigurationFromFile(file: File): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();

//     reader.onload = (event) => {
//       try {
//         const jsonString = event.target?.result as string;
//         const config: NodeConfiguration = JSON.parse(jsonString);

//         // Validate the configuration
//         if (!isValidNodeConfiguration(config)) {
//           reject(new Error('Invalid node configuration format'));
//           return;
//         }

//         const configId = nodeConfigService.loadConfiguration(config);
//         resolve(configId);
//       } catch (error) {
//         reject(new Error(`Failed to parse configuration: ${error}`));
//       }
//     };

//     reader.onerror = () => reject(new Error('Failed to read file'));
//     reader.readAsText(file);
//   });
// }
