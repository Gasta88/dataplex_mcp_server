/**
 * Structured logging utility for MCPB bundle
 * Logs to stderr to avoid interfering with MCP protocol on stdout
 */

import { sanitizeForLogging } from './validation.js';

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

class Logger {
  private debugEnabled: boolean;

  constructor() {
    this.debugEnabled = process.env.DEBUG === 'true' || process.env.DEBUG === '1';
  }

  private log(level: LogLevel, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data }),
    };

    // Always log to stderr (not stdout, which is used for MCP protocol)
    console.error(JSON.stringify(logEntry));
  }

  error(message: string, error?: any): void {
    const errorData = error instanceof Error
      ? {
          name: error.name,
          message: sanitizeForLogging(error.message),
          stack: this.debugEnabled ? error.stack : undefined,
        }
      : error;

    this.log(LogLevel.ERROR, message, errorData);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  debug(message: string, data?: any): void {
    if (this.debugEnabled) {
      this.log(LogLevel.DEBUG, message, data);
    }
  }

  /**
   * Log tool execution
   */
  toolCall(toolName: string, args: any): void {
    this.debug(`Tool called: ${toolName}`, {
      tool: toolName,
      args: this.debugEnabled ? args : '[redacted]',
    });
  }

  /**
   * Log tool result
   */
  toolResult(toolName: string, success: boolean, duration?: number): void {
    this.info(`Tool ${success ? 'succeeded' : 'failed'}: ${toolName}`, {
      tool: toolName,
      success,
      duration: duration ? `${duration}ms` : undefined,
    });
  }

  /**
   * Log API call
   */
  apiCall(service: string, method: string): void {
    this.debug(`API call: ${service}.${method}`, {
      service,
      method,
    });
  }

  /**
   * Log cache hit/miss
   */
  cache(hit: boolean, key: string): void {
    this.debug(`Cache ${hit ? 'hit' : 'miss'}: ${key}`, {
      hit,
      key: sanitizeForLogging(key),
    });
  }
}

// Export singleton instance
export const logger = new Logger();

