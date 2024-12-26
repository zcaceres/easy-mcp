import { type Resource } from "@modelcontextprotocol/sdk/types.js";
import type { EasyMCPResource } from "../types";

export class ResourceError extends Error {}

export class ResourceNotFoundError extends ResourceError {
  message = "Resource not found";
}

export class ResourceConverter {
  static fromMCPResource(resource: EasyMCPResource): Resource {
    return {
      uri: resource.uri,
      name: resource.name,
      description: resource.description,
      mimeType: resource.mimeType,
    };
  }

  static toMCPResource(resource: Resource, fn: Function): EasyMCPResource {
    return {
      uri: resource.uri,
      name: resource.name,
      description: resource.description,
      mimeType: resource.mimeType,
      fn,
    };
  }
}

export default class ResourceManager {
  private resources: Record<string, EasyMCPResource>;
  private constructor() {
    this.resources = {};
  }

  add(resource: Resource, fn: Function) {
    this.resources[resource.uri] = ResourceConverter.toMCPResource(
      resource,
      fn,
    );
  }

  async get(uri: string) {
    const foundResource = this.resources[uri];

    if (!foundResource) {
      throw new ResourceNotFoundError();
    }

    const result = await foundResource.fn();

    return result;
  }

  list() {
    return Object.values(this.resources);
  }

  static create() {
    return new ResourceManager();
  }
}
