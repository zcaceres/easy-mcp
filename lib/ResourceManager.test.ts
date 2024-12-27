import { test, expect, beforeEach, describe } from "bun:test";
import ResourceManager, {
  ResourceNotFoundError,
  ResourceConverter,
} from "./ResourceManager";
import MCPResource from "./MCPResource";

describe("ResourceManager", () => {
  let resourceManager: ResourceManager;

  beforeEach(() => {
    resourceManager = ResourceManager.create();
  });

  test("create() should return a new instance of ResourceManager", () => {
    expect(resourceManager).toBeInstanceOf(ResourceManager);
  });

  test("add() should add a resource", () => {
    const mockResource = {
      uri: "file://test.txt",
      fn: async () => ({ content: "Mock content" }),
    };
    resourceManager.addResource(mockResource);
    const listedResources = resourceManager.listResources();
    expect(listedResources).toHaveLength(1);
    expect(listedResources[0].uri).toBe(mockResource.uri);
  });

  test.skip("get() should return the result of calling the resource function", async () => {
    const mockResource1Config = MCPResource.mocked();
    const mockResource2Config = MCPResource.mocked();
    resourceManager.addResource(mockResource1Config);
    resourceManager.addResource(mockResource2Config);

    const result1 = await resourceManager.get(mockResource1Config.uri);
    const result2 = await resourceManager.get(mockResource2Config.uri);

    // expect(result1).toEqual({
    //   contents: [
    //     {
    //       uri: mockResource1Config.uri,
    //       mimeType: mockResource1Config.mimeType,
    //       text: result1.contents[0].text,
    //     },
    //   ],
    // });
    // expect(result2).toEqual({
    //   contents: [
    //     {
    //       uri: mockResource2Config.uri,
    //       mimeType: mockResource2Config.mimeType,
    //       blob: result2.contents[0].,
    //     },
    //   ],
    // });
  });

  test("get() should throw ResourceNotFoundError for non-existent URI", async () => {
    expect(resourceManager.get("non-existent-uri")).rejects.toThrow(
      ResourceNotFoundError,
    );
  });

  test("list() should return all added resources", () => {
    const mockResources = [
      { uri: "file://test1.txt", fn: async () => ({}) },
      { uri: "file://test2.txt", fn: async () => ({}) },
      { uri: "file://test3.txt", fn: async () => ({}) },
    ];

    mockResources.forEach((resource) => resourceManager.addResource(resource));

    const listedResources = resourceManager.listResources();
    expect(listedResources).toHaveLength(mockResources.length);
    expect(listedResources.map((r) => r.uri)).toEqual(
      expect.arrayContaining(mockResources.map((r) => r.uri)),
    );
  });

  test("list() should return an empty array when no resources are added", () => {
    expect(resourceManager.listResources()).toEqual([]);
  });
});

describe("ResourceConverter", () => {
  test("toSerializableResource should convert MCPResource to ResourceDefinition", () => {
    const mcpResource = MCPResource.create({
      uri: "file://test.txt",
      name: "Test Resource",
      description: "A test resource",
      fn: async () => ({}),
    });

    const result = ResourceConverter.toSerializableResource(mcpResource);
    expect(result).toEqual({
      uri: "file://test.txt",
      name: "Test Resource",
      description: "A test resource",
      args: [],
      mimeType: "text/plain",
    });
    expect(result).not.toHaveProperty("fn");
  });
});
