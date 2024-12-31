import { describe, expect, test, jest, beforeEach } from "bun:test";
import BaseMCP from "./EasyMCP";
import { Tool } from "./decorators/Tool";
import ToolManager from "./ToolManager";

class TestMCP extends BaseMCP {
  constructor() {
    super("TestMCP", { version: "1.0.0" });
  }

  @Tool({
    description: "A function with various parameter types",
    optionals: ["active", "items", "age"],
  })
  exampleFunc(name: string, active?: string, items?: string[], age?: number) {
    return `exampleFunc called: ${name}, ${active}, ${items}, ${age}`;
  }
}

describe("Tool Decorator", () => {
  let mcp: TestMCP;

  beforeEach(() => {
    mcp = new TestMCP();
  });

  test("Tool is added to ToolManager upon class instantiation", () => {
    const tools = mcp.toolManager.list();
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe("exampleFunc");
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
    expect(exampleTool.inputs).toHaveLength(4);
    expect(exampleTool.inputs[0]).toEqual({
      name: "name",
      type: "string",
      description: "",
      required: true,
    });
    expect(exampleTool.inputs[1]).toEqual({
      name: "active",
      type: "string",
      description: "",
      required: false,
    });
    expect(exampleTool.inputs[2]).toEqual({
      name: "items",
      type: "array",
      description: "",
      required: false,
    });
    expect(exampleTool.inputs[3]).toEqual({
      name: "age",
      type: "number",
      description: "",
      required: false,
    });
  });

  test("ToolManager.add is called immediately when decorator is applied", () => {
    const addSpy = jest.spyOn(ToolManager.prototype, "add");

    class SpyTestMCP extends BaseMCP {
      @Tool()
      spyMethod() {}
    }

    new SpyTestMCP("SpyTestMCP", { version: "1.0.0" });

    expect(addSpy).toHaveBeenCalledTimes(1);
    expect(addSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "spyMethod",
      }),
    );

    addSpy.mockRestore();
  });
});
