import type {
  ResourceTemplateConfig,
  ResourceTemplateDefinition,
} from "../types";

class MCPResourceTemplate {
  private _definition: ResourceTemplateDefinition;

  constructor({
    uriTemplate,
    name,
    description,
    mimeType,
  }: ResourceTemplateConfig) {
    this._definition = {
      uriTemplate,
      name: name || uriTemplate,
      description: description || uriTemplate,
      mimeType: mimeType || "text/plain",
    };
  }

  get definition() {
    return this._definition;
  }

  static create(config: ResourceTemplateConfig) {
    return new MCPResourceTemplate(config);
  }

  static mocked() {
    return new MCPResourceTemplate({
      uriTemplate: "file://{filename}/{id}",
      name: "mockedResourceTemplate",
      description: "A mocked resource template",
      mimeType: "text/plain",
    });
  }
}

export default MCPResourceTemplate;
