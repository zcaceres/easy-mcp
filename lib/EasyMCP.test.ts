import { test, expect, beforeEach, describe, mock } from "bun:test";
import BaseMCP from "./EasyMCP";

describe("EasyMCP", () => {
  let easyMCP: BaseMCP;

  beforeEach(() => {
    easyMCP = BaseMCP.create("TestServer", { version: "1.0.0" });
  });

  test("create() should return a new instance of EasyMCP", () => {
    expect(easyMCP).toBeInstanceOf(BaseMCP);
  });

  test("registerCapabilities() should return correct capabilities", () => {
    const capabilities = easyMCP.registerCapabilities();
    expect(capabilities).toHaveProperty("capabilities");
    expect(capabilities.capabilities).toEqual({});

    // Add some resources, tools, prompts, and roots
    easyMCP.resource({
      uri: "test://resource",
      name: "Test Resource",
      description: "A test resource",
      mimeType: "text/plain",
      fn: async () => "Test content",
    });
    easyMCP.tool({
      name: "testTool",
      description: "A test tool",
      fn: async () => "Test result",
    });
    easyMCP.prompt({
      name: "testPrompt",
      description: "A test prompt",
      fn: async () => "Test prompt",
    });
    easyMCP.root({ name: "testRoot", uri: "test://root" });

    const updatedCapabilities = easyMCP.registerCapabilities();
    expect(updatedCapabilities.capabilities).toEqual({
      resources: {},
      tools: {},
      prompts: {},
      roots: {},
    });
  });

  test("tool() should add a tool to the ToolManager", () => {
    const toolConfig = {
      name: "testTool",
      description: "A test tool",
      fn: async () => "Test result",
    };
    easyMCP.tool(toolConfig);
    expect(easyMCP.toolManager.list()).toHaveLength(1);
    expect(easyMCP.toolManager.list()[0].name).toBe("testTool");
  });

  test("resource() should add a resource to the ResourceManager", () => {
    const resourceConfig = {
      uri: "test://resource",
      name: "Test Resource",
      description: "A test resource",
      mimeType: "text/plain" as const,
      fn: async () => "Test content",
    };
    easyMCP.resource(resourceConfig);
    expect(easyMCP.resourceManager.listResources()).toHaveLength(1);
    expect(easyMCP.resourceManager.listResources()[0].uri).toBe(
      "test://resource",
    );
  });

  test("template() should add a template to the ResourceManager", () => {
    const templateConfig = {
      uriTemplate: "test://template/:id",
      name: "Test Template",
      description: "A test template",
      mimeType: "text/plain" as const,
      fn: async () => "Test content",
    };
    easyMCP.template(templateConfig);
    expect(easyMCP.resourceManager.listTemplates()).toHaveLength(1);
    expect(easyMCP.resourceManager.listTemplates()[0].uriTemplate).toBe(
      "test://template/:id",
    );
  });

  test("prompt() should add a prompt to the PromptManager", () => {
    const promptConfig = {
      name: "testPrompt",
      description: "A test prompt",
      fn: () => "Test prompt",
    };
    easyMCP.prompt(promptConfig);
    expect(easyMCP.promptManager.list()).toHaveLength(1);
    expect(easyMCP.promptManager.list()[0].name).toBe("testPrompt");
  });

  test("root() should add a root to the RootsManager", () => {
    const rootConfig = { name: "testRoot", uri: "test://root" };
    easyMCP.root(rootConfig);
    expect(easyMCP.rootsManager.list()).toHaveLength(1);
    expect(easyMCP.rootsManager.list()[0].name).toBe("testRoot");
  });
});
