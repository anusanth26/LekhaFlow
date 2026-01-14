/**
 * ============================================================================
 * LEKHAFLOW WS BACKEND - LOGGER
 * ============================================================================
 * 
 * Simple structured logger for the WebSocket server.
 * Outputs JSON-formatted logs for easy parsing.
 * 
 * LINE-BY-LINE EXPLANATION:
 * - Each log entry includes timestamp, level, message, and optional metadata
 * - Colors are added for terminal readability in development
 * - Production mode outputs pure JSON for log aggregation systems
 */

import type { Logger } from "./types.js";

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
  green: "\x1b[32m",
};

/**
 * Log levels with numeric priorities
 * Lower number = more important
 */
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

/**
 * Format a log entry as colored string (development)
 */
function formatDev(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  const colorMap: Record<LogLevel, string> = {
    error: colors.red,
    warn: colors.yellow,
    info: colors.green,
    debug: colors.gray,
  };
  
  const color = colorMap[level];
  const levelStr = level.toUpperCase().padEnd(5);
  
  let output = `${colors.gray}${timestamp}${colors.reset} ${color}${levelStr}${colors.reset} ${message}`;
  
  if (meta && Object.keys(meta).length > 0) {
    output += ` ${colors.gray}${JSON.stringify(meta)}${colors.reset}`;
  }
  
  return output;
}

/**
 * Format a log entry as JSON (production)
 */
function formatJson(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  });
}

/**
 * Create a logger instance
 * 
 * @param prefix - Optional prefix for all log messages (e.g., module name)
 * @param minLevel - Minimum log level to output (default: info in prod, debug in dev)
 */
export function createLogger(
  prefix?: string,
  minLevel: LogLevel = process.env.NODE_ENV === "production" ? "info" : "debug"
): Logger {
  const isProd = process.env.NODE_ENV === "production";
  const format = isProd ? formatJson : formatDev;
  const minLevelNum = LOG_LEVELS[minLevel];

  /**
   * Internal log function
   * Checks log level before outputting
   */
  const log = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
    // Skip if below minimum level
    if (LOG_LEVELS[level] > minLevelNum) return;

    const fullMessage = prefix ? `[${prefix}] ${message}` : message;
    const output = format(level, fullMessage, meta);

    // Use appropriate console method
    if (level === "error") {
      console.error(output);
    } else if (level === "warn") {
      console.warn(output);
    } else {
      console.log(output);
    }
  };

  // Return logger object with bound methods
  return {
    info: (message, meta) => log("info", message, meta),
    warn: (message, meta) => log("warn", message, meta),
    error: (message, meta) => log("error", message, meta),
    debug: (message, meta) => log("debug", message, meta),
  };
}

// Default logger instance
export const logger = createLogger("WS-Server");
