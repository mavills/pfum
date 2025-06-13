import { Operator } from "./operatorType";
import { operatorPubSub } from "./pubsub";
import { getAllOperatorsWithRetry } from "./operatorApi";

/**
 * Fetches all operators from the remote API
 * @returns Promise<Operator[]> - List of operators from the API
 */
export async function getAllDefaultRemoteOperators(): Promise<Operator[]> {
  try {
    const operators = await getAllOperatorsWithRetry(3);
    return operators;
  } catch (error) {
    console.error("❌ [LOADER] Failed to load operators from API:", error);
    throw new Error(
      `Failed to load operators from API: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Initializes the default operators by fetching them from the API and loading them into the pubsub system
 * @returns Promise<void>
 */
export async function initializeDefaultOperators(): Promise<void> {
  try {
    const operators = await getAllDefaultRemoteOperators();
    operatorPubSub.loadConfigurations(operators);
  } catch (error) {
    console.error("❌ [LOADER] Failed to initialize operators:", error);
    // Don't throw here to prevent the app from crashing - just log the error
    // The UI should handle the case where no operators are available
  }
}
