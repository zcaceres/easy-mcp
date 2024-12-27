import { faker } from "@faker-js/faker";
import type {
  FulfillmentFn,
  MimeTypes,
  ResourceConfig,
  ResourceDefinition,
} from "../types";

class MCPResource {
  private _definition: ResourceDefinition;
  private fn: FulfillmentFn;

  constructor({ uri, name, description, mimeType, fn }: ResourceConfig) {
    this._definition = {
      uri: uri,
      name: name || uri,
      description: description || uri,
      mimeType: mimeType || "text/plain",
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

  static create(config: ResourceConfig) {
    return new MCPResource(config);
  }

  static mocked() {
    return {
      uri: faker.internet.url(),
      name: faker.lorem.word(),
      description: faker.lorem.sentence(),
      mimeType: faker.system.mimeType() as MimeTypes,
      fn: async () => "mocked result",
    };
  }
}

export default MCPResource;
