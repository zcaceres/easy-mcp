import type { PromptConfig } from "../types";
import MCPPrompt from "./MCPPrompt";

export class PromptError extends Error {}

export class PromptNotFoundError extends PromptError {
  message = "Prompt not found";
}

export default class PromptManager {
  private prompts: Record<string, MCPPrompt>;

  private constructor() {
    this.prompts = {};
  }

  add(config: PromptConfig) {
    const prompt = MCPPrompt.create({
      name: config.name,
      description: config.description,
      args: config.args,
      fn: config.fn,
    });
    this.prompts[prompt.definition.name] = prompt;
  }

  list() {
    return Object.values(this.prompts).map((prompt) => prompt.definition);
  }

  async call(name: string, args?: Record<string, unknown>) {
    const foundPrompt = this.prompts[name];

    if (!foundPrompt) {
      throw new PromptNotFoundError();
    }

    const result = await foundPrompt.callFn(args);
    return result;
  }

  static create() {
    return new PromptManager();
  }
}
