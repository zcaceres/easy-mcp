import { describe, expect, spyOn, test, beforeEach } from "bun:test";
import { Tool } from "./decorators/Tool";
import ToolManager from "../ToolManager";
import EasyMCP from "../EasyMCP";

class TestMCP extends EasyMCP {
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
    mcp = new TestMCP({ version: "1.0.0" });
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
