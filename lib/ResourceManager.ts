import { type ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import type {
  ResourceConfig,
  ResourceDefinition,
  ResourceTemplateConfig,
  ResourceTemplateDefinition,
} from "../types";
import URI from "./URI";
import MCPResource from "./MCPResource";
import MCPResourceTemplate from "./MCPResourceTemplate";

export class ResourceError extends Error {}

export class ResourceNotFoundError extends ResourceError {
  message = "Resource not found";
}

export class ResourceConverter {
  static toSerializableResource(resource: MCPResource): ResourceDefinition {
    return resource.definition;
  }

  static toSerializableResourceTemplate(
    resourceTemplate: MCPResourceTemplate,
  ): ResourceTemplateDefinition {
    return resourceTemplate.definition;
  }
}

export default class ResourceManager {
  private resources: Record<string, MCPResource | MCPResourceTemplate>;
  private constructor() {
    this.resources = {};
  }

  addResource(config: ResourceConfig) {
    const resource = MCPResource.create({
      uri: config.uri,
      name: config.name,
      mimeType: config.mimeType,
      description: config.description,
      fn: config.fn,
    });
    // const paramParser = URI.generateParamParserFromURI(uri);
    // const params = URI.parseParamsFromURI(uri, paramParser);

    // const wrappedFn = () =>
    //   fn(params, { uri, getResource: this.get.bind(this) });

    this.resources[config.uri] = resource;
  }

  addTemplate(config: ResourceTemplateConfig) {
    const resourceTemplate = MCPResourceTemplate.create({
      uriTemplate: config.uriTemplate,
      name: config.name,
      mimeType: config.mimeType,
      description: config.description,
    });
    this.resources[config.uriTemplate] = resourceTemplate;
  }

  async get(uri: string): Promise<ReadResourceResult> {
    const foundResource = this.resources[uri];

    if (!foundResource) {
      throw new ResourceNotFoundError();
    }

    // TODO: Discriminate between templates and concrete resources for this to work

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

  listTemplates() {
    return Object.values(this.resources)
      .filter((r) => r instanceof MCPResourceTemplate)
      .map(ResourceConverter.toSerializableResourceTemplate);
  }

  listResources() {
    return Object.values(this.resources)
      .filter((r) => r instanceof MCPResource)
      .map(ResourceConverter.toSerializableResource);
  }

  static create() {
    return new ResourceManager();
  }
}
