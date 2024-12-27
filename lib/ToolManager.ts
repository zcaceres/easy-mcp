import type MCPTool from "./MCPTool";
import type { SerializableTool } from "../types";

export class ToolError extends Error {}

export class ToolNotFoundError extends ToolError {
  message = "Tool not found";
}

export class ToolConverter {
  static toSerializableTool(tool: MCPTool): SerializableTool {
    return {
      name: tool.definition.name,
      description: tool.definition.description,
      inputSchema: tool.definition.input_schema,
    };
  }
}

export default class ToolManager {
  private tools: Record<string, MCPTool>;
  private constructor() {
    this.tools = {};
  }

  add(tool: MCPTool) {
    this.tools[tool.definition.name] = tool;
  }

  list() {
    return Object.values(this.tools).map(ToolConverter.toSerializableTool);
  }

  async call(name: string, args?: Record<string, unknown>) {
    const foundTool = this.tools[name];

    if (!foundTool) {
      throw new ToolNotFoundError();
    }

    const result = await foundTool.callFn(args);
    return result;
  }

  static create() {
    return new ToolManager();
  }
}
