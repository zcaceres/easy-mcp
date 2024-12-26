import type { Resource } from "@modelcontextprotocol/sdk/types.js";

export default class ResourceManager {
  private resources: Record<string, Resource>;
  private constructor() {
    this.resources = {};
  }

  add(resource: Resource) {
    this.resources[resource.uri] = resource;
  }

  get(uri: string) {
    return this.resources[uri];
  }

  list() {
    return Object.values(this.resources);
  }

  static create() {
    return new ResourceManager();
  }
}
