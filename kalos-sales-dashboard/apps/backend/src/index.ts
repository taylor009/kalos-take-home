import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { v4 as uuidv4 } from "uuid";
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import type {
  Transaction,
  Analytics,
  CreateTransactionRequest,
  GetTransactionsResponse,
  GetAnalyticsResponse,
  ApiError,
  WebSocketEvents,
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

// Create HTTP server for Socket.IO integration
const server = createServer();

// Create Socket.IO server
const io = new SocketIOServer<WebSocketEvents>(server, {
  cors: {
    origin: ["http://localhost:3000"],
    credentials: true,
  },
});

// WebSocket broadcasting functions
function broadcastNewTransaction(transaction: Transaction) {
  console.log(
    `📡 Broadcasting new transaction: ${transaction.customerName} - $${transaction.amount}`
  );
  io.emit("server:transaction-added", transaction);
}

function broadcastAnalyticsUpdate(analytics: Analytics) {
  console.log(
    `📊 Broadcasting analytics update: $${analytics.totalRevenue} total revenue`
  );
  io.emit("server:analytics-updated", analytics);
}

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Send welcome message
  socket.emit("server:connected", {
    message: "Connected to Kalos Sales Dashboard",
  });

  // Handle client join
  socket.on("client:join", () => {
    console.log(`👋 Client ${socket.id} joined`);
  });

  // Handle client leave
  socket.on("client:leave", () => {
    console.log(`👋 Client ${socket.id} left`);
  });

  // Handle disconnection
  socket.on("disconnect", (reason) => {
    console.log(`🔌 Client disconnected: ${socket.id}, reason: ${reason}`);
  });

  // Send error messages if needed
  socket.on("error", (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error);
    socket.emit("server:error", {
      error: "SOCKET_ERROR",
      message: "WebSocket error occurred",
      statusCode: 500,
    });
  });
});

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

// POST /api/transactions - Create new transaction with validation and broadcasting
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

    // Broadcast new transaction and updated analytics
    broadcastNewTransaction(transaction);

    const analytics = dataStore.calculateAnalytics();
    broadcastAnalyticsUpdate(analytics);

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

// Create Hono server handler function
const requestHandler = async (req: Request): Promise<Response> => {
  return app.fetch(req);
};

// Handle HTTP requests that are not WebSocket upgrades
server.on("request", async (req, res) => {
  try {
    // Convert Node.js request to Web API Request
    const url = `http://${req.headers.host}${req.url}`;
    const method = req.method || "GET";

    // Handle request body for POST requests
    let body: BodyInit | undefined;
    if (method !== "GET" && method !== "HEAD") {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      body = Buffer.concat(chunks);
    }

    // Create Web API Request object
    const webRequest = new Request(url, {
      method,
      headers: req.headers as HeadersInit,
      body,
    });

    // Process with Hono
    const response = await requestHandler(webRequest);

    // Convert Web API Response back to Node.js response
    res.statusCode = response.status;

    // Set response headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Send response body
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }

    res.end();
  } catch (error) {
    console.error("Server error:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
});

// Start the server
server.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📊 Kalos Sales Dashboard API`);
  console.log(`🌐 HTTP: http://localhost:${port}`);
  console.log(`🔌 WebSocket: ws://localhost:${port}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`  GET    /api/health      - Health check`);
  console.log(`  GET    /api/transactions - Get all transactions`);
  console.log(`  POST   /api/transactions - Create new transaction`);
  console.log(`  GET    /api/analytics   - Get analytics summary`);
  console.log(`\n⚡ Real-time features:`);
  console.log(`  📡 WebSocket events: transaction-added, analytics-updated`);
  console.log(`  🔄 Live updates on transaction creation`);
});
