import type { LoggingLevel } from "@modelcontextprotocol/sdk/types.js";

/**
 * Prefixes messages with their log level
 */
export default class LogFormatter {
  static format(level: LoggingLevel, message: string): string {
    switch (level) {
      case "debug":
        return this.debug(message);
      case "info":
        return this.info(message);
      case "warning":
        return this.warning(message);
      case "error":
        return this.error(message);
      default:
        console.warn(
          "Invalid log level passed to LogFormatter. This should never happen.",
          level,
        );
        return message;
    }
  }

  private static debug(message: string) {
    return "debug: " + message;
  }

  private static info(message: string) {
    return "info: " + message;
  }

  private static warning(message: string) {
    return "warning: " + message;
  }

  private static error(message: string) {
    return "error: " + message;
  }
}
