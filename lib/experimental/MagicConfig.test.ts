import { describe, expect, spyOn, test, beforeEach } from "bun:test";
import { Tool } from "./decorators/Tool";
import ToolManager from "../ToolManager";
import EasyMCP from "../EasyMCP";
import { Context } from "../Context";

class TestMCP extends EasyMCP {
  @Tool({
    description: "A function with various parameter types",
    optionals: ["active", "items", "age"],
  })
  exampleFunc(name: string, active?: string, items?: string[], age?: number) {
    return `exampleFunc called: ${name}, ${active}, ${items}, ${age}`;
  }

  @Tool({
    description: "A function with a Context parameter",
  })
  toolWithContext(param1: string, context: Context) {
    return `toolWithContext called: ${param1}, ${context ? "with context" : "no context"}`;
  }

  @Tool({
    description: "A function without a Context parameter",
  })
  toolWithoutContext(param1: string, param2: number) {
    return `toolWithoutContext called: ${param1}, ${param2}`;
  }
}

describe("Tool Decorator with Context", () => {
  let mcp: TestMCP;

  beforeEach(() => {
    mcp = new TestMCP({ version: "1.0.0" });
  });

  test("Tool with Context parameter is registered correctly", () => {
    const tools = mcp.toolManager.list();
    const toolWithContext = tools.find((t) => t.name === "toolWithContext");

    expect(toolWithContext).toBeDefined();
    expect(toolWithContext!.inputSchema.properties).toHaveProperty("param1");
    expect(toolWithContext!.inputSchema.properties).not.toHaveProperty(
      "context",
    );
    expect(toolWithContext!.inputSchema.required).toEqual(["param1"]);
  });

  test("Tool with Context parameter is registered correctly", () => {
    const tools = mcp.toolManager.list();
    const toolWithContext = tools.find((t) => t.name === "toolWithContext");

    expect(toolWithContext).toBeDefined();
    expect(toolWithContext!.inputSchema.properties).toHaveProperty("param1");
    expect(toolWithContext!.inputSchema.properties).not.toHaveProperty(
      "context",
    );
    expect(Object.keys(toolWithContext!.inputSchema.properties)).toHaveLength(
      1,
    );
    expect(toolWithContext!.inputSchema.required).toEqual(["param1"]);
  });

  test("Tool is added to ToolManager upon class instantiation", () => {
    const tools = mcp.toolManager.list();
    expect(tools).toHaveLength(3);
    expect(tools[0].name).toBe("exampleFunc");
  });

  test("Calling tool with Context executes correctly", async () => {
    const mockContext = {} as Context; // Create a mock Context object
    const result = await mcp.toolManager.call(
      "toolWithContext",
      { param1: "test" },
      mockContext,
    );
    expect(result).toBe("toolWithContext called: test, with context");
  });

  test("Calling tool without Context executes correctly", async () => {
    const result = await mcp.toolManager.call(
      "toolWithoutContext",
      { param1: "test", param2: 42 },
      {} as Context,
    );
    expect(result).toBe("toolWithoutContext called: test, 42");
  });

  test("Calling the method executes the original function", () => {
    const result = mcp.exampleFunc("John", "yes", ["item1", "item2"], 30);
    expect(result).toBe("exampleFunc called: John, yes, item1,item2, 30");
  });

  test("Metadata is correctly captured", () => {
    const tools = mcp.toolManager.list();
    const exampleTool = tools[0];

    expect(exampleTool.name).toBe("exampleFunc");
    expect(exampleTool.description).toBe(
      "A function with various parameter types",
    );
    expect(Object.values(exampleTool.inputSchema.properties)).toHaveLength(4);

    expect(exampleTool.inputSchema.properties["name"].type).toBe("string");
    expect(exampleTool.inputSchema.properties["name"].description).toBe(
      "a param named name of type string",
    );

    expect(exampleTool.inputSchema.properties["active"].type).toBe("string");
    expect(exampleTool.inputSchema.properties["active"].description).toBe(
      "a param named active of type string",
    );

    expect(exampleTool.inputSchema.properties["items"].type).toBe("array");
    expect(exampleTool.inputSchema.properties["items"].description).toBe(
      "a param named items of type array",
    );

    expect(exampleTool.inputSchema.properties["age"].type).toBe("number");
    expect(exampleTool.inputSchema.properties["age"].description).toBe(
      "a param named age of type number",
    );
  });

  test("ToolManager.add is called immediately when decorator is applied", () => {
    const addSpy = spyOn(ToolManager.prototype, "add");

    class SpyTestMCP extends EasyMCP {
      @Tool()
      spyMethod() {}
    }

    new SpyTestMCP({ version: "1.0.0" });

    expect(addSpy).toHaveBeenCalledTimes(1);
    expect(addSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "spyMethod",
      }),
    );

    addSpy.mockRestore();
  });
});
