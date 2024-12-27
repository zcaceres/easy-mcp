import type {
  FulfillmentFn,
  ResourceConfig,
  ResourceDefinition,
} from "../types";

class MCPResource {
  private _definition: ResourceDefinition;
  private fn: FulfillmentFn;

  constructor({
    uri,
    name,
    description,
    args = [],
    mimeType,
    fn,
  }: ResourceConfig) {
    this._definition = {
      uri: uri,
      name: name || uri,
      description: description || uri,
      args: args,
      mimeType: mimeType || "",
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
    return new MCPResource({
      uri: "mockedResource",
      name: "mockedResource",
      description: "A mocked resource",
      args: [],
      mimeType: "text/plain",
      fn: async () => "mocked result",
    });
  }
}

export default MCPResource;
