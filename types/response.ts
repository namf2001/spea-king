// Standard API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
  meta?: MetaData;
}

// Error response structure
export interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
}

// Metadata for pagination and additional info
export interface MetaData {
  pagination?: Pagination;
  timestamp?: number;
  [key: string]: any;
}

// Pagination structure
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Helper functions to create consistent responses
export const createSuccessResponse = <T>(
  data: T,
  meta?: MetaData,
): ApiResponse<T> => ({
  success: true,
  data,
  meta,
});

export const createErrorResponse = (
  code: string,
  message: string,
  details?: any,
): ApiResponse => ({
  success: false,
  error: { code, message, details },
  meta: { timestamp: Date.now() },
});
