import type {
  FulfillmentFn,
  ResourceTemplateConfig,
  ResourceTemplateDefinition,
} from "../types";

class MCPResourceTemplate {
  private _definition: ResourceTemplateDefinition;
  fn: FulfillmentFn;

  constructor({
    uriTemplate,
    name,
    description,
    mimeType,
    fn,
  }: ResourceTemplateConfig) {
    this._definition = {
      uriTemplate,
      name: name || uriTemplate,
      description: description || uriTemplate,
      mimeType: mimeType || ("text/plain" as const),
    };
    this.fn = fn;
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
      fn: async ({ filename, id }) => {
        return `file://${filename}/${id}/file1.txt`;
      },
    });
  }
}

export default MCPResourceTemplate;
