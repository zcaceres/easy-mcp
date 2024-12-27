import { test, expect, beforeEach, describe } from "bun:test";
import ToolManager, { ToolNotFoundError, ToolConverter } from "./ToolManager";
import MCPTool from "./MCPTool";

describe("ToolManager", () => {
  let toolManager: ToolManager;

  beforeEach(() => {
    toolManager = ToolManager.create();
  });

  test("create() should return a new instance of ToolManager", () => {
    expect(toolManager).toBeInstanceOf(ToolManager);
  });

  test("add() should add a tool", () => {
    const mockTool = MCPTool.mocked();
    toolManager.add(mockTool);
    const listedTools = toolManager.list();
    expect(listedTools).toHaveLength(1);
    expect(listedTools[0].name).toBe(mockTool.name);
  });

  test("list() should return all added tools", () => {
    const mockTool1 = MCPTool.mocked();
    const mockTool2 = MCPTool.mocked();
    toolManager.add(mockTool1);
    toolManager.add(mockTool2);

    const listedTools = toolManager.list();
    expect(listedTools).toHaveLength(2);
    expect(listedTools[0].name).toBe(mockTool1.name);
    expect(listedTools[1].name).toBe(mockTool2.name);
  });

  test("list() should return an empty array when no tools are added", () => {
    expect(toolManager.list()).toEqual([]);
  });

  test("call() should execute the tool function", async () => {
    const mockTool = MCPTool.mocked();
    toolManager.add(mockTool);

    const result = await toolManager.call(mockTool.name);
    expect(result).toBe("mocked result");
  });

  test("call() should throw ToolNotFoundError for non-existent tool", async () => {
    expect(toolManager.call("non-existent-tool")).rejects.toThrow(
      ToolNotFoundError,
    );
  });
});

describe("ToolConverter", () => {
  test("toSerializableTool should convert MCPTool to SerializableTool", () => {
    const mockToolConfig = MCPTool.mocked();
    const mockTool = MCPTool.create(mockToolConfig);
    const result = ToolConverter.toSerializableTool(mockTool);

    expect(result).toEqual({
      name: mockTool.definition.name,
      description: mockTool.definition.description,
      inputSchema: mockTool.definition.input_schema,
    });
    expect(result).not.toHaveProperty("fn");
  });
});
