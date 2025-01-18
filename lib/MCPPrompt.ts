import { faker } from "@faker-js/faker";
import type { FulfillmentFn, PromptConfig, PromptDefinition } from "../types";

class MCPPrompt {
  private _definition: PromptDefinition;
  private fn: FulfillmentFn;

  constructor({ name, description, args, fn }: PromptConfig) {
    this._definition = {
      name: name,
      description: description || name,
      args: args || [],
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
    return {
      name: faker.lorem.word(),
      description: faker.lorem.sentence(),
      args: [
        {
          name: faker.lorem.word(),
          description: faker.lorem.sentence(),
          required: faker.datatype.boolean(),
        },
      ],
      fn: async () => "prompt result",
    };
  }
}

export default MCPPrompt;
