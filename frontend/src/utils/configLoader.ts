import { NodeConfiguration } from "../types/nodeConfig";
import { nodeConfigService } from "../services/nodeConfigService";

/**
 * Load node configurations from JSON files or configuration objects.
 * In a real application, this could read from:
 * - Local JSON files in a configs directory
 * - A remote API
 * - A configuration database
 * - Environment variables or build-time configuration
 */

// Load configurations from the public/configs directory
export async function loadConfigurationsFromPublicDirectory(): Promise<
  string[]
> {
  try {
    // First, load the manifest to know which files to load
    const manifestResponse = await fetch("/configs/manifest.json");
    if (!manifestResponse.ok) {
      throw new Error(`Failed to load manifest: ${manifestResponse.status}`);
    }

    const manifest = await manifestResponse.json();
    const configIds: string[] = [];

    // Load each configuration file listed in the manifest
    for (const configInfo of manifest.configurations) {
      try {
        const configResponse = await fetch(`/configs/${configInfo.file}`);
        if (!configResponse.ok) {
          console.warn(
            `Failed to load ${configInfo.file}: ${configResponse.status}`
          );
          continue;
        }

        const config: NodeConfiguration = await configResponse.json();

        // Load the configuration into the service
        const configId = nodeConfigService.loadConfiguration(config);
        configIds.push(configId);
      } catch (error) {
        console.error(
          `Failed to load configuration from ${configInfo.file}:`,
          error
        );
      }
    }

    return configIds;
  } catch (error) {
    console.error(
      "Failed to load configurations from public directory:",
      error
    );
    throw error;
  }
}
