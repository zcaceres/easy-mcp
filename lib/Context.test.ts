import { expect, test, mock, beforeEach, describe } from "bun:test";
import { Context } from "./Context";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import ResourceManager from "./ResourceManager";
import EasyMCP from "./EasyMCP";

describe("Context", () => {
  let mockServer: Server;
  let mockResourceManager: ResourceManager;
  let context: Context;
  let mockMeta: any;

  beforeEach(() => {
    mockServer = {
      notification: mock(() => Promise.resolve()),
      sendLoggingMessage: mock(() => {}),
    } as unknown as Server;

    mockResourceManager = {
      get: mock((uri: string) =>
        Promise.resolve({
          contents: [
            { uri, mimeType: "text/plain", text: "Mock resource content" },
          ],
        }),
      ),
    } as unknown as ResourceManager;

    mockMeta = {
      progressToken: "mock-progress-token",
      someOtherMetadata: "value",
    };

    context = new Context(mockServer, mockResourceManager, mockMeta);
  });

  test("reportProgress sends notification with correct data", async () => {
    await context.reportProgress(50, 100);

    expect(mockServer.notification).toHaveBeenCalledWith({
      method: "notifications/progress",
      params: {
        progressToken: "mock-progress-token",
        progress: 50,
        total: 100,
      },
    });
  });

  test("readResource returns content for valid URI", async () => {
    const content = await context.readResource("test://uri");

    expect(content).toBe("Mock resource content");
    expect(mockResourceManager.get).toHaveBeenCalledWith("test://uri");
  });

  test("readResource throws error for non-existent resource", async () => {
    mockResourceManager.get = mock(() => Promise.resolve({ contents: [] }));

    expect(context.readResource("non-existent://uri")).rejects.toThrow(
      "Resource not found",
    );
  });

  test("log methods send correct logging messages", () => {
    context.debug("Debug message");
    context.info("Info message");
    context.warning("Warning message");
    context.error("Error message");

    expect(mockServer.sendLoggingMessage).toHaveBeenCalledTimes(4);
    expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
      level: "debug",
      data: "Debug message",
    });
    expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
      level: "info",
      data: "Info message",
    });
    expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
      level: "warning",
      data: "Warning message",
    });
    expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
      level: "error",
      data: "Error message",
    });
  });

  test("meta property returns correct metadata", () => {
    expect(context.meta).toEqual(mockMeta);
  });
});

describe("EasyMCP with Context", () => {
  let easyMCP: EasyMCP;

  beforeEach(() => {
    easyMCP = EasyMCP.create("TestMCP", { version: "1.0.0" });
  });

  test("Context methods are callable from tool", async () => {
    let logCalled = false;
    let progressReported = false;

    easyMCP.tool({
      name: "testTool",
      fn: async (args: any, context: Context) => {
        context.info("Test log");
        logCalled = true;
        await context.reportProgress(50, 100);
        progressReported = true;
        return "Test result";
      },
    });

    await easyMCP.toolManager.call(
      "testTool",
      {},
      new Context(
        {
          sendLoggingMessage: () => {},
          notification: () => Promise.resolve(),
        } as unknown as Server,
        {} as ResourceManager,
        { progressToken: "test-token" },
      ),
    );

    expect(logCalled).toBe(true);
    expect(progressReported).toBe(true);
  });
});
