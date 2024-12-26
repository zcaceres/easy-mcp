import { type Resource } from "@modelcontextprotocol/sdk/types.js";
import type { EasyMCPResource, ResourceRequestFn } from "../types";
import URI from "./URI";

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

  static toMCPResource(
    resource: Resource,
    fn: ResourceRequestFn,
  ): EasyMCPResource {
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

  add(resource: Resource, fn: ResourceRequestFn) {
    const paramParser = URI.generateParamParserFromURI(resource.uri);
    const params = URI.parseParamsFromURI(resource.uri, paramParser);

    const wrappedFn = () =>
      fn(params, { uri: resource.uri, getResource: this.get.bind(this) });

    this.resources[resource.uri] = ResourceConverter.toMCPResource(
      resource,
      wrappedFn,
    );
  }

  async get(uri: string) {
    const foundResource = this.resources[uri];

    if (!foundResource) {
      throw new ResourceNotFoundError();
    }

    const paramParser = URI.generateParamParserFromURI(uri);
    const params = URI.parseParamsFromURI(uri, paramParser);

    const result = await foundResource.fn({ ...params });

    return result;
  }

  list() {
    return Object.values(this.resources);
  }

  static create() {
    return new ResourceManager();
  }
}
