import { test, expect, beforeEach, describe, mock } from "bun:test";
import EasyMCP from "./EasyMCP";
import { Context } from "./Context";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

describe("EasyMCP", () => {
  let easyMCP: EasyMCP;

  beforeEach(() => {
    easyMCP = EasyMCP.create("TestServer", { version: "1.0.0" });
  });

  test("create() should return a new instance of EasyMCP", () => {
    expect(easyMCP.name).toBe("TestServer");
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

describe("Context in EasyMCP", () => {
  let easyMCP: EasyMCP;
  let mockServer: Server;

  beforeEach(() => {
    mockServer = {
      notification: mock(() => Promise.resolve()),
      sendLoggingMessage: mock(() => {}),
    } as unknown as Server;

    easyMCP = EasyMCP.create("TestServer", { version: "1.0.0" });
    // @ts-ignore: Accessing private property for testing
    easyMCP.server = mockServer;
  });

  test("createContext() should return a Context instance", async () => {
    const context = await easyMCP.createContext("test-token");
    expect(context).toBeInstanceOf(Context);
    expect(context.progressToken).toBe("test-token");
  });

  test("Context should be able to report progress", async () => {
    const context = await easyMCP.createContext("test-token");
    await context.reportProgress(50, 100);

    expect(mockServer.notification).toHaveBeenCalledWith({
      method: "notifications/progress",
      params: {
        progressToken: "test-token",
        progress: 50,
        total: 100,
      },
    });
  });

  test("Context should be able to read resources", async () => {
    const mockResourceContent = "Test resource content";
    // @ts-ignore: Accessing private property for testing
    easyMCP.resourceManager.get = mock(() =>
      Promise.resolve({
        contents: [
          {
            uri: "test://resource",
            mimeType: "text/plain",
            text: mockResourceContent,
          },
        ],
      }),
    );

    const context = await easyMCP.createContext("test-token");
    const content = await context.readResource("test://resource");

    expect(content).toBe(mockResourceContent);
    // @ts-ignore: Accessing private property for testing
    expect(easyMCP.resourceManager.get).toHaveBeenCalledWith("test://resource");
  });

  test("Context should be able to log messages", async () => {
    const context = await easyMCP.createContext("test-token");
    context.info("Test message", "TestLogger");

    expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
      level: "info",
      data: "Test message",
      logger: "TestLogger",
    });
  });

  test("Context should be used in tool calls", async () => {
    const toolConfig = {
      name: "testTool",
      description: "A test tool",
      fn: mock((args: any, context: Context) => {
        expect(context).toBeInstanceOf(Context);
        expect(context.progressToken).toBe("test-token");
        return Promise.resolve("Test result");
      }),
    };
    easyMCP.tool(toolConfig);

    // Simulate a tool call
    // @ts-ignore: Accessing private property for testing
    const result = await easyMCP.toolManager.call(
      "testTool",
      {},
      await easyMCP.createContext("test-token"),
    );

    expect(result).toBe("Test result");
    expect(toolConfig.fn).toHaveBeenCalled();
  });
});
