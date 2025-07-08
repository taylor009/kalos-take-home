import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { v4 as uuidv4 } from "uuid";
import type {
  Transaction,
  Analytics,
  CreateTransactionRequest,
  GetTransactionsResponse,
  GetAnalyticsResponse,
  ApiError,
} from "@shared";

const app = new Hono();

// In-memory data store
class DataStore {
  private transactions: Transaction[] = [];
  private transactionMap: Map<string, Transaction> = new Map();

  // Add some sample data for testing
  constructor() {
    this.seedData();
  }

  private seedData() {
    const sampleTransactions: Omit<Transaction, "id">[] = [
      {
        date: new Date("2024-01-15T10:30:00Z").toISOString(),
        customerName: "John Smith",
        amount: 299.99,
        currency: "USD",
      },
      {
        date: new Date("2024-01-15T14:20:00Z").toISOString(),
        customerName: "Sarah Johnson",
        amount: 149.5,
        currency: "USD",
      },
      {
        date: new Date("2024-01-16T09:15:00Z").toISOString(),
        customerName: "Mike Davis",
        amount: 499.99,
        currency: "USD",
      },
    ];

    sampleTransactions.forEach((transaction) => {
      this.createTransaction(transaction);
    });
  }

  createTransaction(data: Omit<Transaction, "id">): Transaction {
    const transaction: Transaction = {
      id: uuidv4(),
      ...data,
      date: data.date || new Date().toISOString(),
    };

    this.transactions.push(transaction);
    this.transactionMap.set(transaction.id, transaction);

    // Sort transactions by date (newest first)
    this.transactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return transaction;
  }

  getAllTransactions(): Transaction[] {
    return [...this.transactions];
  }

  getTransactionById(id: string): Transaction | undefined {
    return this.transactionMap.get(id);
  }

  calculateAnalytics(): Analytics {
    const totalRevenue = this.transactions.reduce((sum, transaction) => {
      // For simplicity, assume all amounts are in USD for now
      return sum + transaction.amount;
    }, 0);

    return {
      totalRevenue,
      transactionCount: this.transactions.length,
      currency: "USD",
    };
  }
}

// Initialize data store
const dataStore = new DataStore();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000"], // Next.js dev server
    credentials: true,
  })
);

// Validation helpers
function validateCreateTransactionRequest(
  data: any
): CreateTransactionRequest | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const { customerName, amount, currency } = data;

  if (typeof customerName !== "string" || customerName.trim().length === 0) {
    return null;
  }

  if (typeof amount !== "number" || amount <= 0 || !isFinite(amount)) {
    return null;
  }

  if (
    typeof currency !== "string" ||
    !["USD", "EUR", "GBP", "CAD", "AUD"].includes(currency)
  ) {
    return null;
  }

  return {
    customerName: customerName.trim(),
    amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
    currency,
  };
}

function createErrorResponse(
  error: string,
  message: string,
  statusCode: number
): ApiError {
  return {
    error,
    message,
    statusCode,
  };
}

// Basic health check
app.get("/", (c) => {
  return c.json({
    message: "Kalos Sales Dashboard API",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get("/api/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// GET /api/transactions - Return all transactions
app.get("/api/transactions", (c) => {
  try {
    const transactions = dataStore.getAllTransactions();

    const response: GetTransactionsResponse = {
      transactions,
      total: transactions.length,
    };

    return c.json(response);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    const errorResponse = createErrorResponse(
      "FETCH_TRANSACTIONS_ERROR",
      "Failed to fetch transactions",
      500
    );
    return c.json(errorResponse, 500);
  }
});

// POST /api/transactions - Create new transaction with validation
app.post("/api/transactions", async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = validateCreateTransactionRequest(body);

    if (!validatedData) {
      const errorResponse = createErrorResponse(
        "VALIDATION_ERROR",
        "Invalid transaction data. Required: customerName (string), amount (positive number), currency (USD/EUR/GBP/CAD/AUD)",
        400
      );
      return c.json(errorResponse, 400);
    }

    const transaction = dataStore.createTransaction(validatedData);

    return c.json(transaction, 201);
  } catch (error) {
    console.error("Error creating transaction:", error);

    if (error instanceof SyntaxError) {
      const errorResponse = createErrorResponse(
        "INVALID_JSON",
        "Invalid JSON format",
        400
      );
      return c.json(errorResponse, 400);
    }

    const errorResponse = createErrorResponse(
      "CREATE_TRANSACTION_ERROR",
      "Failed to create transaction",
      500
    );
    return c.json(errorResponse, 500);
  }
});

// GET /api/analytics - Calculate and return total revenue
app.get("/api/analytics", (c) => {
  try {
    const analytics = dataStore.calculateAnalytics();

    const response: GetAnalyticsResponse = {
      analytics,
    };

    return c.json(response);
  } catch (error) {
    console.error("Error calculating analytics:", error);
    const errorResponse = createErrorResponse(
      "ANALYTICS_ERROR",
      "Failed to calculate analytics",
      500
    );
    return c.json(errorResponse, 500);
  }
});

// 404 handler
app.notFound((c) => {
  const errorResponse = createErrorResponse(
    "NOT_FOUND",
    "Endpoint not found",
    404
  );
  return c.json(errorResponse, 404);
});

// Global error handler
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  const errorResponse = createErrorResponse(
    "INTERNAL_ERROR",
    "Internal server error",
    500
  );
  return c.json(errorResponse, 500);
});

const port = 3001;

console.log(`🚀 Server is running on port ${port}`);
console.log(`📊 Kalos Sales Dashboard API`);
console.log(`🌐 http://localhost:${port}`);
console.log(`\n📋 Available endpoints:`);
console.log(`  GET    /api/health      - Health check`);
console.log(`  GET    /api/transactions - Get all transactions`);
console.log(`  POST   /api/transactions - Create new transaction`);
console.log(`  GET    /api/analytics   - Get analytics summary`);

serve({
  fetch: app.fetch,
  port,
});
