import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { EasyMCPTool, ToolOptions, ToolRequestFn } from "../types";

export class ToolError extends Error {}

export class ToolNotFoundError extends ToolError {
  message = "Tool not found";
}

export class ToolConverter {
  static fromMCPTool(tool: EasyMCPTool): Tool {
    return {
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    };
  }

  static toMCPTool(tool: Tool, fn: ToolRequestFn): EasyMCPTool {
    return {
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      fn,
    };
  }
}

export default class ToolManager {
  private tools: Record<string, EasyMCPTool>;
  private constructor() {
    this.tools = {};
  }

  add(name: string, fn: ToolRequestFn, opts: ToolOptions) {
    this.tools[name] = ToolConverter.toMCPTool(
      {
        name,
        inputSchema: opts.inputSchema ?? {},
        description: opts.description,
      },
      fn,
    );
  }

  list() {
    return Object.values(this.tools).map(ToolConverter.fromMCPTool);
  }

  async call(name: string, args?: Record<string, unknown>) {
    const foundTool = this.tools[name];

    if (!foundTool) {
      throw new ToolNotFoundError();
    }

    const result = await foundTool.fn(args);
    return result;
  }

  static create() {
    return new ToolManager();
  }
}
