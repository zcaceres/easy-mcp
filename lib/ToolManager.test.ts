import { test, expect, beforeEach, describe } from "bun:test";
import ToolManager, { ToolNotFoundError, ToolConverter } from "./ToolManager";
import type { EasyMCPTool } from "../types";
import { createMockTool } from "./mocks";

describe("ToolManager", () => {
  let toolManager: ToolManager;

  beforeEach(() => {
    toolManager = ToolManager.create();
  });

  test("create() should return a new instance of ToolManager", () => {
    expect(toolManager).toBeInstanceOf(ToolManager);
  });

  test("add() should add a tool with a function", async () => {
    const mockTool = createMockTool();
    const mockFn = async () => ({ result: "Mock result" });
    toolManager.add(mockTool.name, mockFn, mockTool);
    const result = await toolManager.get(mockTool.name);
    expect(result).toEqual(expect.objectContaining(mockTool));
  });

  test("get() should return the added tool", async () => {
    const mockTool1 = createMockTool();
    const mockTool2 = createMockTool();
    const mockFn1 = async () => ({ result: "Result 1" });
    const mockFn2 = async () => ({ result: "Result 2" });

    toolManager.add(mockTool1.name, mockFn1, mockTool1);
    toolManager.add(mockTool2.name, mockFn2, mockTool2);

    const result1 = await toolManager.get(mockTool1.name);
    const result2 = await toolManager.get(mockTool2.name);
    expect(result1).toEqual(expect.objectContaining(mockTool1));
    expect(result2).toEqual(expect.objectContaining(mockTool2));
  });

  test("get() should throw ToolNotFoundError for non-existent tool", async () => {
    expect(toolManager.get("non-existent-tool")).rejects.toThrow(
      ToolNotFoundError,
    );
  });

  test("list() should return all added tools", () => {
    const mockTools = [createMockTool(), createMockTool(), createMockTool()];

    mockTools.forEach((tool) =>
      toolManager.add(tool.name, async () => ({}), tool),
    );

    const listedTools = toolManager.list();
    expect(listedTools).toHaveLength(mockTools.length);
    expect(listedTools).toEqual(
      expect.arrayContaining(
        mockTools.map((tool) => expect.objectContaining(tool)),
      ),
    );
  });

  test("list() should return an empty array when no tools are added", () => {
    expect(toolManager.list()).toEqual([]);
  });
});

describe("ToolConverter", () => {
  test("fromMCPTool should convert EasyMCPTool to Tool", () => {
    const mockTool = createMockTool();
    const easyMCPTool: EasyMCPTool = {
      ...mockTool,
      fn: async () => ({}),
    };

    const result = ToolConverter.fromMCPTool(easyMCPTool);
    expect(result).toEqual(mockTool);
    expect(result).not.toHaveProperty("fn");
  });

  test("toMCPTool should convert Tool to EasyMCPTool", () => {
    const mockTool = createMockTool();
    const mockFn = async () => ({});

    const result = ToolConverter.toMCPTool(mockTool, mockFn);
    expect(result).toEqual({
      ...mockTool,
      fn: mockFn,
    });
  });
});
