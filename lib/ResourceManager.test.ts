import { test, expect, beforeEach, describe } from "bun:test";
import ResourceManager, {
  ResourceNotFoundError,
  ResourceConverter,
} from "./ResourceManager";
import MCPResource from "./MCPResource";
import MCPResourceTemplate from "./MCPResourceTemplate";

describe("ResourceManager", () => {
  let resourceManager: ResourceManager;

  beforeEach(() => {
    resourceManager = ResourceManager.create();
  });

  test("create() should return a new instance of ResourceManager", () => {
    expect(resourceManager).toBeInstanceOf(ResourceManager);
  });

  test("addResource() should add a resource", () => {
    const mockResource = {
      uri: "file://test.txt",
      name: "Test Resource",
      mimeType: "text/plain" as const,
      description: "A test resource",
      fn: async () => "Mock content",
    };
    resourceManager.addResource(mockResource);
    const listedResources = resourceManager.listResources();
    expect(listedResources).toHaveLength(1);
    expect(listedResources[0].uri).toBe(mockResource.uri);
  });

  test("addTemplate() should add a resource template", () => {
    const mockTemplate = {
      uriTemplate: "file://{filename}",
      name: "Test Template",
      mimeType: "text/plain" as const,
      description: "A test template",
    };
    resourceManager.addTemplate(mockTemplate);
    const listedTemplates = resourceManager.listTemplates();
    expect(listedTemplates).toHaveLength(1);
    expect(listedTemplates[0].uriTemplate).toBe(mockTemplate.uriTemplate);
  });

  test("get() should return the result of calling the resource function", async () => {
    const mockResource = {
      uri: "file://test.txt",
      name: "Test Resource",
      mimeType: "text/plain" as const,
      description: "A test resource",
      fn: async () => "Mock content",
    };
    resourceManager.addResource(mockResource);

    const result = await resourceManager.get(mockResource.uri);

    expect(result).toEqual({
      contents: [
        {
          uri: mockResource.uri,
          mimeType: mockResource.mimeType,
          text: "Mock content",
        },
      ],
    });
  });

  test("get() should throw ResourceNotFoundError for non-existent URI", async () => {
    expect(resourceManager.get("non-existent-uri")).rejects.toThrow(
      ResourceNotFoundError,
    );
  });

  test("get() should throw an error for resource templates", async () => {
    const mockTemplate = {
      uriTemplate: "file://{filename}",
      name: "Test Template",
      mimeType: "text/plain" as const,
      description: "A test template",
    };
    resourceManager.addTemplate(mockTemplate);

    expect(resourceManager.get(mockTemplate.uriTemplate)).rejects.toThrow(
      "NOT IMPLEMENTED",
    );
  });

  test("listResources() should return all added resources", () => {
    const mockResources = [
      {
        uri: "file://test1.txt",
        name: "Test 1",
        mimeType: "text/plain" as const,
        description: "Test 1",
        fn: async () => "1",
      },
      {
        uri: "file://test2.txt",
        name: "Test 2",
        mimeType: "text/plain" as const,
        description: "Test 2",
        fn: async () => "2",
      },
      {
        uri: "file://test3.txt",
        name: "Test 3",
        mimeType: "text/plain" as const,
        description: "Test 3",
        fn: async () => "3",
      },
    ];

    mockResources.forEach((resource) => resourceManager.addResource(resource));

    const listedResources = resourceManager.listResources();
    expect(listedResources).toHaveLength(mockResources.length);
    expect(listedResources.map((r) => r.uri)).toEqual(
      expect.arrayContaining(mockResources.map((r) => r.uri)),
    );
  });

  test("listTemplates() should return all added resource templates", () => {
    const mockTemplates = [
      {
        uriTemplate: "file://{filename1}",
        name: "Template 1",
        mimeType: "text/plain" as const,
        description: "Template 1",
      },
      {
        uriTemplate: "file://{filename2}",
        name: "Template 2",
        mimeType: "text/plain" as const,
        description: "Template 2",
      },
    ];

    mockTemplates.forEach((template) => resourceManager.addTemplate(template));

    const listedTemplates = resourceManager.listTemplates();
    expect(listedTemplates).toHaveLength(mockTemplates.length);
    expect(listedTemplates.map((t) => t.uriTemplate)).toEqual(
      expect.arrayContaining(mockTemplates.map((t) => t.uriTemplate)),
    );
  });

  test("listResources() should return an empty array when no resources are added", () => {
    expect(resourceManager.listResources()).toEqual([]);
  });

  test("listTemplates() should return an empty array when no templates are added", () => {
    expect(resourceManager.listTemplates()).toEqual([]);
  });
});

describe("ResourceConverter", () => {
  test("toSerializableResource should convert MCPResource to ResourceDefinition", () => {
    const mcpResource = MCPResource.create({
      uri: "file://test.txt",
      name: "Test Resource",
      description: "A test resource",
      mimeType: "text/plain" as const,
      fn: async () => "test",
    });

    const result = ResourceConverter.toSerializableResource(mcpResource);
    expect(result).toEqual({
      uri: "file://test.txt",
      name: "Test Resource",
      description: "A test resource",
      args: [],
      mimeType: "text/plain" as const,
    });
    expect(result).not.toHaveProperty("fn");
  });

  test("toSerializableResourceTemplate should convert MCPResourceTemplate to ResourceTemplateDefinition", () => {
    const mcpResourceTemplate = MCPResourceTemplate.create({
      uriTemplate: "file://{filename}",
      name: "Test Template",
      description: "A test template",
      mimeType: "text/plain" as const,
    });

    const result =
      ResourceConverter.toSerializableResourceTemplate(mcpResourceTemplate);
    expect(result).toEqual({
      uriTemplate: "file://{filename}",
      name: "Test Template",
      description: "A test template",
      mimeType: "text/plain" as const,
    });
  });
});
