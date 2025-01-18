import { faker } from "@faker-js/faker";
import type { ToolArg, ToolConfig, ToolDefinition } from "../types";
import type { Context } from "./Context";

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

  async callFn(
    args?: Record<string, unknown>,
    context?: Context,
  ): Promise<any> {
    const results = await this.fn(args, context);
    return results;
  }

  static create(config: ToolConfig) {
    return new MCPTool({
      name: config.name,
      description: config.description,
      inputs: config.inputs || [],
      fn: config.fn,
    });
  }

  static mocked() {
    return {
      name: faker.word.noun(),
      description: faker.lorem.sentence(),
      inputs: [
        {
          name: faker.word.adjective(),
          type: faker.helpers.arrayElement([
            "string",
            "number",
            "array",
            "object",
          ]),
          description: faker.lorem.sentence(),
          required: faker.datatype.boolean(),
        },
      ],
      // We want fn to be deterministic for testing.
      fn: async () => "mocked result",
    };
  }
}

export default MCPTool;
