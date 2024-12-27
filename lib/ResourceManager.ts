import {
  type ReadResourceResult,
  type Resource,
} from "@modelcontextprotocol/sdk/types.js";
import type {
  ResourceConfig,
  ResourceDefinition,
  ResourceRequestFn,
} from "../types";
import URI from "./URI";
import MCPResource from "./MCPResource";

export class ResourceError extends Error {}

export class ResourceNotFoundError extends ResourceError {
  message = "Resource not found";
}

export class ResourceConverter {
  static toSerializableResource(resource: MCPResource): ResourceDefinition {
    return resource.definition;
  }
}

export default class ResourceManager {
  private resources: Record<string, MCPResource>;
  private constructor() {
    this.resources = {};
  }

  add(config: ResourceConfig) {
    const resource = MCPResource.create({
      uri: config.uri,
      name: config.name,
      description: config.description,
      fn: config.fn,
    });
    // const paramParser = URI.generateParamParserFromURI(uri);
    // const params = URI.parseParamsFromURI(uri, paramParser);

    // const wrappedFn = () =>
    //   fn(params, { uri, getResource: this.get.bind(this) });

    this.resources[config.uri] = resource;
  }

  async get(uri: string): Promise<ReadResourceResult> {
    const foundResource = this.resources[uri];

    if (!foundResource) {
      throw new ResourceNotFoundError();
    }

    const paramParser = URI.generateParamParserFromURI(uri);
    const params = URI.parseParamsFromURI(uri, paramParser);

    const result = await foundResource.callFn({ ...params });

    // @TODO conversion to expected result types here

    return {
      contents: [
        {
          uri: uri,
          mimeType: foundResource.definition.mimeType,
          text: result,
        },
      ],
    };
  }

  list() {
    return Object.values(this.resources).map(
      ResourceConverter.toSerializableResource,
    );
  }

  static create() {
    return new ResourceManager();
  }
}
