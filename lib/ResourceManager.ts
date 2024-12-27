import { type ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import type {
  ResourceCache,
  ResourceConfig,
  ResourceDefinition,
  ResourceTemplateCache,
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
  private resources: ResourceCache;
  private templates: ResourceTemplateCache;

  private constructor() {
    this.resources = {};
    this.templates = {};
  }

  addResource(config: ResourceConfig) {
    if (this.resources[config.uri]) {
      console.warn("Resource already exists... overwriting");
    }

    const resource = MCPResource.create({
      uri: config.uri,
      name: config.name,
      mimeType: config.mimeType,
      description: config.description,
      fn: config.fn,
    });

    this.resources[config.uri] = resource;
  }

  addTemplate(config: ResourceTemplateConfig) {
    if (this.templates[config.uriTemplate]) {
      console.warn("Template already exists... overwriting");
    }

    const resourceTemplate = MCPResourceTemplate.create({
      uriTemplate: config.uriTemplate,
      name: config.name,
      mimeType: config.mimeType,
      description: config.description,
      fn: config.fn,
    });

    this.templates[config.uriTemplate] = resourceTemplate;
  }

  private createResourceFromTemplate(
    uri: string,
    template: MCPResourceTemplate,
  ) {
    const params = URI.extractParamsFromURI(uri, template);

    // We cache the call as a resource. This seems desirable for performance reasons since we always try to get a resource directly at first.
    this.addResource({
      uri: uri,
      name: uri,
      description: template.definition.description,
      mimeType: template.definition.mimeType,
      // Wrap the template function with the params implied by the call to the template uri
      fn: async () => template.fn(params),
    });

    return this.get(uri);
  }

  async get(uri: string): Promise<ReadResourceResult> {
    const foundResource = this.resources[uri];
    if (foundResource) {
      const result = await foundResource.callFn();
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

    // @TODO conversion to expected result types here

    const foundTemplate = URI.findMatchingTemplate(uri, this.templates);

    if (foundTemplate) {
      return this.createResourceFromTemplate(uri, foundTemplate);
    }

    throw new ResourceNotFoundError();
  }

  listTemplates() {
    return Object.values(this.templates)
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
