/**
 * Input validation and sanitization utilities for MCPB bundle
 */

/**
 * Validate dataset ID format
 * Must be alphanumeric with underscores, max 1024 characters
 */
export function validateDatasetId(datasetId: unknown): string {
  if (typeof datasetId !== 'string') {
    throw new Error('Dataset ID must be a string');
  }
  
  if (!datasetId || datasetId.trim().length === 0) {
    throw new Error('Dataset ID cannot be empty');
  }
  
  if (datasetId.length > 1024) {
    throw new Error('Dataset ID exceeds maximum length of 1024 characters');
  }
  
  // BigQuery dataset ID pattern: alphanumeric and underscores
  const pattern = /^[a-zA-Z0-9_]+$/;
  if (!pattern.test(datasetId)) {
    throw new Error(
      'Invalid dataset ID format. Must contain only letters, numbers, and underscores.'
    );
  }
  
  return datasetId;
}

/**
 * Validate table ID format
 * Must be alphanumeric with underscores, max 1024 characters
 */
export function validateTableId(tableId: unknown): string {
  if (typeof tableId !== 'string') {
    throw new Error('Table ID must be a string');
  }
  
  if (!tableId || tableId.trim().length === 0) {
    throw new Error('Table ID cannot be empty');
  }
  
  if (tableId.length > 1024) {
    throw new Error('Table ID exceeds maximum length of 1024 characters');
  }
  
  // BigQuery table ID pattern: alphanumeric and underscores
  const pattern = /^[a-zA-Z0-9_]+$/;
  if (!pattern.test(tableId)) {
    throw new Error(
      'Invalid table ID format. Must contain only letters, numbers, and underscores.'
    );
  }
  
  return tableId;
}

/**
 * Validate and sanitize tool arguments
 */
export function validateToolArgs(args: unknown): Record<string, unknown> {
  if (!args || typeof args !== 'object') {
    throw new Error('Tool arguments must be an object');
  }
  
  return args as Record<string, unknown>;
}

/**
 * Create a user-friendly error message
 */
export function createErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Remove sensitive information from error messages
    let message = error.message;
    
    // Remove file paths that might contain sensitive info
    message = message.replace(/\/[^\s]+\.json/g, '[credentials file]');
    
    // Remove API keys or tokens
    message = message.replace(/[A-Za-z0-9_-]{20,}/g, '[redacted]');
    
    return message;
  }
  
  return 'An unknown error occurred';
}

/**
 * Validate numeric depth parameter
 */
export function validateDepth(depth: unknown, max: number = 10): number {
  if (typeof depth !== 'number') {
    throw new Error('Depth must be a number');
  }
  
  if (!Number.isInteger(depth)) {
    throw new Error('Depth must be an integer');
  }
  
  if (depth < 1) {
    throw new Error('Depth must be at least 1');
  }
  
  if (depth > max) {
    throw new Error(`Depth cannot exceed ${max}`);
  }
  
  return depth;
}

/**
 * Sanitize string for logging (remove sensitive data)
 */
export function sanitizeForLogging(str: string): string {
  return str
    .replace(/[A-Za-z0-9_-]{20,}/g, '[redacted]')
    .replace(/\/[^\s]+\.json/g, '[credentials]')
    .replace(/"private_key":\s*"[^"]+"/g, '"private_key": "[redacted]"');
}

