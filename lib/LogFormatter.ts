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
      case "notice":
        return this.notice(message);
      case "critical":
        return this.critical(message);
      case "alert":
        return this.alert(message);
      case "emergency":
        return this.emergency(message);
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

  private static notice(message: string) {
    return "notice: " + message;
  }

  private static critical(message: string) {
    return "critical: " + message;
  }

  private static alert(message: string) {
    return "alert: " + message;
  }

  private static emergency(message: string) {
    return "emergency: " + message;
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
