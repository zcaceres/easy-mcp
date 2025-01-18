import MCPTool from "./MCPTool";
import { Context } from "./Context";
import type { SerializableTool, ToolConfig } from "../types";

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

  add(config: ToolConfig) {
    const tool = MCPTool.create({
      name: config.name,
      description: config.description,
      inputs: config.inputs,
      fn: config.fn,
    });
    this.tools[tool.definition.name] = tool;
  }

  list() {
    return Object.values(this.tools).map(ToolConverter.toSerializableTool);
  }

  async call(
    name: string,
    args?: Record<string, unknown>,
    context?: Context,
  ): Promise<any> {
    const foundTool = this.tools[name];

    if (!foundTool) {
      throw new ToolNotFoundError();
    }

    const result = await foundTool.callFn(args, context);
    return result;
  }

  static create() {
    return new ToolManager();
  }
}
