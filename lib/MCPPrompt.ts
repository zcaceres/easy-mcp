import type { PromptConfig, PromptDefinition } from "../types";

class MCPPrompt {
  private _definition: PromptDefinition;
  private fn: (...args: any[]) => Promise<any>;

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
}

export default MCPPrompt;
