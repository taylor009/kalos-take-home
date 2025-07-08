import type {
  Transaction,
  CreateTransactionRequest,
  GetTransactionsResponse,
  GetAnalyticsResponse,
  ApiError as ApiErrorResponse,
} from "@shared";

const API_BASE_URL = "http://localhost:3001";

// API Error handling
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      const errorData = data as ApiErrorResponse;
      throw new ApiError(
        response.status,
        errorData.error || "UNKNOWN_ERROR",
        errorData.message || "An error occurred"
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    throw new ApiError(
      0,
      "NETWORK_ERROR",
      "Failed to connect to server. Please check your connection."
    );
  }
}

// API Functions
export const api = {
  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return apiRequest("/api/health");
  },

  // Fetch all transactions
  async fetchTransactions(): Promise<GetTransactionsResponse> {
    return apiRequest<GetTransactionsResponse>("/api/transactions");
  },

  // Create a new transaction
  async createTransaction(
    transaction: CreateTransactionRequest
  ): Promise<Transaction> {
    return apiRequest<Transaction>("/api/transactions", {
      method: "POST",
      body: JSON.stringify(transaction),
    });
  },

  // Fetch analytics
  async fetchAnalytics(): Promise<GetAnalyticsResponse> {
    return apiRequest<GetAnalyticsResponse>("/api/analytics");
  },
};

// Export individual functions for convenience
export const {
  healthCheck,
  fetchTransactions,
  createTransaction,
  fetchAnalytics,
} = api;
