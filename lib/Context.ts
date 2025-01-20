import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type {
  LoggingLevel,
  ProgressNotification,
  ProgressToken,
} from "@modelcontextprotocol/sdk/types.js";
import ResourceManager from "./ResourceManager";
import type { CallToolMeta } from "../types";

export class Context {
  private server: Server;
  private resourceManager: ResourceManager;
  private _progressToken?: ProgressToken;
  private _meta: CallToolMeta;

  constructor(
    server: Server,
    resourceManager: ResourceManager,
    meta: CallToolMeta,
  ) {
    this.server = server;
    this.resourceManager = resourceManager;
    this._progressToken = meta.progressToken;
    this._meta = meta;
  }

  async reportProgress(progress: number, total?: number): Promise<void> {
    if (this._progressToken) {
      const notification: ProgressNotification = {
        method: "notifications/progress",
        params: {
          progressToken: this._progressToken,
          progress,
          total,
        },
      };
      await this.server.notification(notification);
    }
  }

  async readResource(uri: string): Promise<string | Uint8Array> {
    const result = await this.resourceManager.get(uri);
    if (result.contents.length === 0) {
      throw new Error(`Resource not found: ${uri}`);
    }
    const content = result.contents[0];
    if ("text" in content) {
      return content.text as string;
    } else if ("blob" in content) {
      // This line converts a base64-encoded string to a Uint8Array
      // 1. atob(content.blob) decodes the base64 string to a regular string
      // 2. Uint8Array.from() creates a new Uint8Array from this string
      // 3. The mapping function (c) => c.charCodeAt(0) converts each character to its UTF-16 code unit
      return Uint8Array.from(atob(content.blob), (c) => c.charCodeAt(0));
    }
    throw new Error(`Unsupported resource content type for ${uri}`);
  }

  get progressToken(): ProgressToken | undefined {
    return this._progressToken;
  }

  get meta(): CallToolMeta {
    return this._meta;
  }

  log(
    level: LoggingLevel,
    message: string,
    loggerName?: string,
  ): Promise<void> {
    return this.server.sendLoggingMessage({
      level,
      data: message,
      logger: loggerName,
    });
  }

  debug(message: string, loggerName?: string): Promise<void> {
    return this.log("debug", message, loggerName);
  }

  info(message: string, loggerName?: string): Promise<void> {
    return this.log("info", message, loggerName);
  }

  warning(message: string, loggerName?: string): Promise<void> {
    return this.log("warning", message, loggerName);
  }

  error(message: string, loggerName?: string): Promise<void> {
    return this.log("error", message, loggerName);
  }
}
