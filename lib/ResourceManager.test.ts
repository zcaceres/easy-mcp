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
    resourceManager.add(mockResource);
    const listedResources = resourceManager.list();
    expect(listedResources).toHaveLength(1);
    expect(listedResources[0].uri).toBe(mockResource.uri);
  });

  test("get() should return the result of calling the resource function", async () => {
    const mockResource1 = {
      uri: "file://test1.txt",
      fn: async () => "Content 1",
    };
    const mockResource2 = {
      uri: "file://test2.txt",
      fn: async () => "Content 2",
    };
    resourceManager.add(mockResource1);
    resourceManager.add(mockResource2);

    const result1 = await resourceManager.get(mockResource1.uri);
    const result2 = await resourceManager.get(mockResource2.uri);
    expect(result1).toEqual({
      contents: [{ uri: "file://test1.txt", mimeType: "", text: "Content 1" }],
    });
    expect(result2).toEqual({
      contents: [{ uri: "file://test2.txt", mimeType: "", text: "Content 2" }],
    });
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

    mockResources.forEach((resource) => resourceManager.add(resource));

    const listedResources = resourceManager.list();
    expect(listedResources).toHaveLength(mockResources.length);
    expect(listedResources.map((r) => r.uri)).toEqual(
      expect.arrayContaining(mockResources.map((r) => r.uri)),
    );
  });

  test("list() should return an empty array when no resources are added", () => {
    expect(resourceManager.list()).toEqual([]);
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
      mimeType: "",
    });
    expect(result).not.toHaveProperty("fn");
  });
});
