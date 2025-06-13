import { Operator } from "./operatorType";

interface OperatorsResponse {
  operators: Operator[];
}

export class OperatorApiService {
  private readonly baseUrl: string = "http://localhost:8000";

  /**
   * Asks for an update on a node based on the current graph export
   */
  async updateNode(nodeId: string, graphExport: any) {
    const response = await fetch(`${this.baseUrl}/nodes/update`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ node_id: nodeId, graph: graphExport }),
    });

    if (!response.ok) {
      console.log("response", await response.json());
      throw new Error(
        `Failed to update node: ${response.status} ${response.statusText}`
      );
    }
    // returns the new data for the node
    const data = await response.json();
    return data.operator;
  }

  /**
   * Fetches all operators from the remote API
   * @returns Promise<Operator[]> - List of operators
   * @throws Error if the API request fails
   */
  async getAllOperators(): Promise<Operator[]> {
    try {
      const response = await fetch(`${this.baseUrl}/nodes/`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch operators: ${response.status} ${response.statusText}`
        );
      }

      const data: OperatorsResponse = await response.json();

      if (!data.operators || !Array.isArray(data.operators)) {
        throw new Error(
          "Invalid API response: operators key is missing or not an array"
        );
      }

      return data.operators;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error fetching operators: ${error.message}`);
      }
      throw new Error("Unknown error occurred while fetching operators");
    }
  }

  /**
   * Fetches operators with additional error handling and retry logic
   * @param retries - Number of retry attempts (default: 3)
   * @returns Promise<Operator[]> - List of operators
   */
  async getAllOperatorsWithRetry(retries: number = 3): Promise<Operator[]> {
    let lastError: Error;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.getAllOperators();
      } catch (error) {
        lastError = error as Error;

        if (attempt === retries) {
          break;
        }

        // Wait before retrying (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }

    throw lastError!;
  }
}

// Export a singleton instance for convenience
export const operatorApi = new OperatorApiService();

// Export individual functions for easier imports
export const getAllOperators = () => operatorApi.getAllOperators();
export const getAllOperatorsWithRetry = (retries?: number) =>
  operatorApi.getAllOperatorsWithRetry(retries);
