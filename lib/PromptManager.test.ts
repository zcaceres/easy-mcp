import { test, expect, beforeEach, describe } from "bun:test";
import PromptManager, { PromptNotFoundError } from "./PromptManager";
import MCPPrompt from "./MCPPrompt";

describe("PromptManager", () => {
  let promptManager: PromptManager;

  beforeEach(() => {
    promptManager = PromptManager.create();
  });

  test("create() should return a new instance of PromptManager", () => {
    expect(promptManager).toBeInstanceOf(PromptManager);
  });

  test("add() should add a prompt", () => {
    const mockPrompt = MCPPrompt.mocked();
    promptManager.add(mockPrompt);
    const listedPrompts = promptManager.list();
    expect(listedPrompts).toHaveLength(1);
    expect(listedPrompts[0].name).toBe(mockPrompt.definition.name);
  });

  test("list() should return all added prompts", () => {
    const mockPrompt1 = MCPPrompt.mocked();
    const mockPrompt2 = MCPPrompt.create({
      name: "anotherPrompt",
      description: "Another mocked prompt",
      args: [],
      fn: async () => "another result",
    });

    promptManager.add(mockPrompt1);
    promptManager.add(mockPrompt2);

    const listedPrompts = promptManager.list();
    expect(listedPrompts).toHaveLength(2);
    expect(listedPrompts[0].name).toBe(mockPrompt1.definition.name);
    expect(listedPrompts[1].name).toBe(mockPrompt2.definition.name);
  });

  test("list() should return an empty array when no prompts are added", () => {
    expect(promptManager.list()).toEqual([]);
  });

  test("call() should execute the prompt function", async () => {
    const mockPrompt = MCPPrompt.mocked();
    promptManager.add(mockPrompt);

    const result = await promptManager.call(mockPrompt.definition.name);
    expect(result).toBe("mocked result");
  });

  test("call() should throw PromptNotFoundError for non-existent prompt", async () => {
    expect(promptManager.call("non-existent-prompt")).rejects.toThrow(
      PromptNotFoundError,
    );
  });
});