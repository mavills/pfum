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

async function loadRemoteOperator(configLocation: string): Promise<Operator> {
  const configResponse = await fetch(configLocation);
  if (!configResponse.ok) {
    throw new Error(`Failed to load config: ${configResponse.status}`);
  }
  return configResponse.json();
}

export async function getAllDefaultRemoteOperators(): Promise<Operator[]> {
  const operatorLocations = await listOperators();
  const operators = await Promise.all(operatorLocations.map(loadRemoteOperator));
  return operators;
}

export async function initializeDefaultOperators(): Promise<void> {
  const operators = await getAllDefaultRemoteOperators();
  operatorPubSub.loadConfigurations(operators);
}
