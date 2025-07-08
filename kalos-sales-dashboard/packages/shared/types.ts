// Core Data Types
export interface Transaction {
  id: string;
  date: string; // ISO 8601 date string
  customerName: string;
  amount: number;
  currency: string;
}

export interface Analytics {
  totalRevenue: number;
  transactionCount: number;
  currency: string;
}

// API Request/Response Types
export interface CreateTransactionRequest {
  customerName: string;
  amount: number;
  currency: string;
}

export interface GetTransactionsResponse {
  transactions: Transaction[];
  total: number;
}

export interface GetAnalyticsResponse {
  analytics: Analytics;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
}

// WebSocket Event Types
export interface WebSocketEvents {
  // Client to Server events
  'client:join': undefined;
  'client:leave': undefined;
  
  // Server to Client events
  'server:transaction-added': Transaction;
  'server:analytics-updated': Analytics;
  'server:error': ApiError;
  'server:connected': { message: string };
  'server:disconnected': { message: string };
}

// Search and Filter Types
export interface TransactionFilters {
  customerName?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
}

export interface SearchTransactionsRequest {
  filters?: TransactionFilters;
  limit?: number;
  offset?: number;
}

// Utility Types
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

export type TransactionSortField = 'date' | 'amount' | 'customerName';
export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
  field: TransactionSortField;
  direction: SortDirection;
}
