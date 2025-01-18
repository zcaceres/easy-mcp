import { expect, test, describe, beforeEach } from "bun:test";
import EasyMCP from "../EasyMCP";
import emitter from "events";
import { Tool } from "./decorators/Tool";
import { Resource } from "./decorators/Resource";
import { Prompt } from "./decorators/Prompt";
import { Root } from "./decorators/Root";
import { Context } from "../Context";

// We'll get memory leak errors if we don't raise this number (just in this test suite)
emitter.setMaxListeners(100);

@Root("/another-root", { name: "Named Root" })
@Root("/test-root/photos")
class TestMCP extends EasyMCP {
  @Tool()
  simpleTool(param1: string, param2: number) {
    return `${param1}: ${param2}`;
  }

  @Tool({
    description: "A tool with optional parameters",
    optionals: ["optionalParam"],
  })
  toolWithOptionals(requiredParam: string, optionalParam?: number) {
    return `${requiredParam}: ${optionalParam || "not provided"}`;
  }

  @Resource("test://simple-resource")
  simpleResource() {
    return "Simple resource content";
  }

  @Resource("test://resource/{param}")
  resourceWithParam(param: string) {
    return `Resource content with param: ${param}`;
  }

  @Prompt()
  simplePrompt(name: string) {
    return `Hello, ${name}!`;
  }

  @Prompt({
    name: "customPrompt",
    description: "A custom prompt with multiple parameters",
    args: [
      { name: "name", description: "User's name", required: true },
      { name: "age", description: "User's age", required: false },
    ],
  })
  customPrompt(name: string, age?: number) {
    return `Hello, ${name}${age ? ` (${age} years old)` : ""}!`;
  }
}

describe("Decorator Functionality", () => {
  let mcp: TestMCP;

  beforeEach(() => {
    mcp = new TestMCP({ version: "1.0.0" });
  });

  describe("@Root Decorator", () => {
    test("should register roots correctly", () => {
      const roots = mcp.rootsManager.list();
      // expect(roots).toHaveLength(2);
      expect(roots[0]).toEqual({
        uri: "/test-root/photos",
        name: "testRootPhotos",
      });
      expect(roots[1]).toEqual({ uri: "/another-root", name: "Named Root" });
    });
  });

  describe("@Tool Decorator", () => {
    test("should register simple tool correctly", () => {
      const tools = mcp.toolManager.list();
      const simpleTool = tools.find((t) => t.name === "simpleTool");
      expect(simpleTool).toBeDefined();
      expect(simpleTool!.inputSchema.properties).toHaveProperty("param1");
      expect(simpleTool!.inputSchema.properties).toHaveProperty("param2");
    });

    test("should register tool with optional parameters correctly", () => {
      const tools = mcp.toolManager.list();
      const toolWithOptionals = tools.find(
        (t) => t.name === "toolWithOptionals",
      );
      expect(toolWithOptionals).toBeDefined();
      expect(toolWithOptionals!.description).toBe(
        "A tool with optional parameters",
      );
      expect(toolWithOptionals!.inputSchema.required).not.toContain(
        "optionalParam",
      );
    });

    test("should be able to call decorated tool", async () => {
      const result = await mcp.toolManager.call(
        "simpleTool",
        { param1: "test", param2: 42 },
        {} as Context,
      );
      expect(result).toBe("test: 42");
    });
  });

  describe("@Resource Decorator", () => {
    test("should register simple resource correctly", () => {
      const resources = mcp.resourceManager.listResources();
      const simpleResource = resources.find(
        (r) => r.uri === "test://simple-resource",
      );
      expect(simpleResource).toBeDefined();
    });

    test("should register resource with parameters correctly", () => {
      const templates = mcp.resourceManager.listTemplates();
      const resourceWithParam = templates.find(
        (t) => t.uriTemplate === "test://resource/{param}",
      );
      expect(resourceWithParam).toBeDefined();
    });

    test("should be able to get content from decorated resource", async () => {
      const result = await mcp.resourceManager.get("test://simple-resource");
      expect(result.contents[0].text).toBe("Simple resource content");
    });

    test("should be able to get content from decorated resource with parameter", async () => {
      const result = await mcp.resourceManager.get("test://resource/testParam");
      expect(result.contents[0].text).toBe(
        "Resource content with param: testParam",
      );
    });
  });

  describe("@Prompt Decorator", () => {
    test("should register simple prompt correctly", () => {
      const prompts = mcp.promptManager.list();
      const simplePrompt = prompts.find((p) => p.name === "simplePrompt");
      expect(simplePrompt).toBeDefined();
      expect(simplePrompt!.args).toHaveLength(1);
    });

    test("should register custom prompt correctly", () => {
      const prompts = mcp.promptManager.list();
      const customPrompt = prompts.find((p) => p.name === "customPrompt");
      expect(customPrompt).toBeDefined();
      expect(customPrompt!.description).toBe(
        "A custom prompt with multiple parameters",
      );
      expect(customPrompt!.args).toHaveLength(2);
    });

    test("should be able to call decorated prompt", async () => {
      const result = await mcp.promptManager.call("simplePrompt", {
        name: "Test",
      });
      expect(result).toBe("Hello, Test!");
    });

    test("should be able to call custom decorated prompt", async () => {
      const result = await mcp.promptManager.call("customPrompt", {
        name: "Test",
        age: 30,
      });
      expect(result).toBe("Hello, Test (30 years old)!");
    });
  });
});
