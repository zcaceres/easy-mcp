import type { FulfillmentFn, PromptConfig, PromptDefinition } from "../types";

class MCPPrompt {
  private _definition: PromptDefinition;
  private fn: FulfillmentFn;

  constructor({ name, description, args, fn }: PromptConfig) {
    this._definition = {
      name: name,
      description: description,
      arguments: args,
    };
    this.fn = fn;
  }

  get definition() {
    return this._definition;
  }

  async callFn(...args: any): Promise<any> {
    const results = await this.fn(...args);
    return results;
  }

  static create(config: PromptConfig) {
    return new MCPPrompt(config);
  }

  static mocked() {
    return new MCPPrompt({
      name: "mockedPrompt",
      description: "A mocked prompt",
      args: [
        {
          name: "mockedArg",
          type: "string",
          description: "A mocked arg",
          required: true,
        },
      ],
      fn: async () => "mocked result",
    });
  }
}

export default MCPPrompt;
