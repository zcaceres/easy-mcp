import type { ToolArg, ToolConfig, ToolDefinition } from "../types";

class MCPTool {
  private _definition: ToolDefinition;
  private fn: (...args: any[]) => Promise<any>;

  private constructor({ name, description, inputs = [], fn }: ToolConfig) {
    this._definition = {
      name: name,
      description: description || name,
      input_schema: {
        type: "object",
        properties: this.generateInputSchema(inputs),
        required: inputs
          .filter((input) => input.required)
          .map((input) => input.name),
      },
    };
    this.fn = fn;
  }

  get definition() {
    return this._definition;
  }

  private generateInputSchema(toolInputs: ToolArg[]) {
    const properties: Record<string, any> = {};
    toolInputs.forEach((input) => {
      properties[input.name] = {
        type: input.type,
        description: input.description,
      };
    });
    return properties;
  }

  async callFn(...args: any): Promise<any> {
    const results = await this.fn(...args);
    return results;
  }

  static create(config: ToolConfig) {
    return new MCPTool(config);
  }

  static mocked() {
    return new MCPTool({
      name: "mockedTool",
      description: "A mocked tool",
      inputs: [
        {
          name: "mockedInput",
          type: "string",
          description: "A mocked input",
          required: true,
        },
      ],
      fn: async () => "mocked result",
    });
  }
}

export default MCPTool;
