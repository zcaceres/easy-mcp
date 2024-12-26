import { test, expect, beforeEach, describe } from "bun:test";
import ResourceManager, {
  ResourceNotFoundError,
  ResourceConverter,
} from "./ResourceManager";
import type { Resource } from "@modelcontextprotocol/sdk/types.js";
import type { EasyMCPResource } from "../types";
import { createMockResource } from "./mocks";

describe("ResourceManager", () => {
  let resourceManager: ResourceManager;

  beforeEach(() => {
    resourceManager = ResourceManager.create();
  });

  test("create() should return a new instance of ResourceManager", () => {
    expect(resourceManager).toBeInstanceOf(ResourceManager);
  });

  test("add() should add a resource with a function", async () => {
    const mockResource = createMockResource();
    const mockFn = async () => ({ content: "Mock content" });
    resourceManager.add(mockResource, mockFn);
    const result = await resourceManager.get(mockResource.uri);
    expect(result).toEqual({ content: "Mock content" });
  });

  test("get() should return the result of calling the resource function", async () => {
    const mockResource1 = createMockResource();
    const mockResource2 = createMockResource();
    const mockFn1 = async () => ({ content: "Content 1" });
    const mockFn2 = async () => ({ content: "Content 2" });
    resourceManager.add(mockResource1, mockFn1);
    resourceManager.add(mockResource2, mockFn2);

    const result1 = await resourceManager.get(mockResource1.uri);
    const result2 = await resourceManager.get(mockResource2.uri);
    expect(result1).toEqual({ content: "Content 1" });
    expect(result2).toEqual({ content: "Content 2" });
  });

  test("get() should throw ResourceNotFoundError for non-existent URI", async () => {
    expect(resourceManager.get("non-existent-uri")).rejects.toThrow(
      ResourceNotFoundError,
    );
  });

  test("list() should return all added resources", () => {
    const mockResources = [
      createMockResource(),
      createMockResource(),
      createMockResource(),
    ];

    mockResources.forEach((resource) =>
      resourceManager.add(resource, async () => ({})),
    );

    const listedResources = resourceManager.list();
    expect(listedResources).toHaveLength(mockResources.length);
    expect(listedResources).toEqual(
      expect.arrayContaining(
        mockResources.map((resource) => expect.objectContaining(resource)),
      ),
    );
  });

  test("list() should return an empty array when no resources are added", () => {
    expect(resourceManager.list()).toEqual([]);
  });
});

describe("ResourceConverter", () => {
  test("fromMCPResource should convert EasyMCPResource to Resource", () => {
    const easyMCPResource: EasyMCPResource = {
      uri: "test-uri",
      name: "Test Resource",
      description: "A test resource",
      mimeType: "text/plain",
      fn: async () => ({}),
    };

    const result = ResourceConverter.fromMCPResource(easyMCPResource);
    expect(result).toEqual({
      uri: "test-uri",
      name: "Test Resource",
      description: "A test resource",
      mimeType: "text/plain",
    });
    expect(result).not.toHaveProperty("fn");
  });

  test("toMCPResource should convert Resource to EasyMCPResource", () => {
    const resource: Resource = {
      uri: "test-uri",
      name: "Test Resource",
      description: "A test resource",
      mimeType: "text/plain",
    };
    const mockFn = async () => ({});

    const result = ResourceConverter.toMCPResource(resource, mockFn);
    expect(result).toEqual({
      uri: "test-uri",
      name: "Test Resource",
      description: "A test resource",
      mimeType: "text/plain",
      fn: mockFn,
    });
  });
});
