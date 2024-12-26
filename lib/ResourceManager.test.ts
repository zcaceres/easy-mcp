import { test, expect, beforeEach, describe } from "bun:test";
import { faker } from "@faker-js/faker";
import ResourceManager from "./ResourceManager";
import type { Resource } from "@modelcontextprotocol/sdk/types.js";

function createMockResource(): Resource {
  return {
    uri: faker.internet.url(),
    name: faker.lorem.word(),
    description: faker.lorem.sentence(),
    mimeType: faker.system.mimeType(),
  };
}

describe("ResourceManager", () => {
  let resourceManager: ResourceManager;

  beforeEach(() => {
    resourceManager = ResourceManager.create();
  });

  test("create() should return a new instance of ResourceManager", () => {
    expect(resourceManager).toBeInstanceOf(ResourceManager);
  });

  test("add() should add a resource", () => {
    const mockResource = createMockResource();
    resourceManager.add(mockResource);
    expect(resourceManager.get(mockResource.uri)).toEqual(mockResource);
  });

  test("get() should return the correct resource", () => {
    const mockResource1 = createMockResource();
    const mockResource2 = createMockResource();
    resourceManager.add(mockResource1);
    resourceManager.add(mockResource2);

    expect(resourceManager.get(mockResource1.uri)).toEqual(mockResource1);
    expect(resourceManager.get(mockResource2.uri)).toEqual(mockResource2);
  });

  test("get() should return undefined for non-existent resource", () => {
    expect(resourceManager.get("non-existent-uri")).toBeUndefined();
  });

  test("list() should return all added resources", () => {
    const mockResources = [
      createMockResource(),
      createMockResource(),
      createMockResource(),
    ];

    mockResources.forEach((resource) => resourceManager.add(resource));

    const listedResources = resourceManager.list();
    expect(listedResources).toHaveLength(mockResources.length);
    expect(listedResources).toEqual(expect.arrayContaining(mockResources));
  });

  test("list() should return an empty array when no resources are added", () => {
    expect(resourceManager.list()).toEqual([]);
  });
});
