import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type {
  PromptConfig,
  ResourceConfig,
  ResourceTemplateConfig,
  ServerOptions,
  ToolConfig,
  UninitializedServer,
} from "../types";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import ResourceManager, {
  ResourceError,
  ResourceNotFoundError,
} from "./ResourceManager";
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListRootsRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  type CallToolResult,
  type GetPromptResult,
  type ListPromptsResult,
  type ListResourcesResult,
  type ListResourceTemplatesResult,
  type ListRootsResult,
  type ListToolsResult,
  type ReadResourceRequest,
  type ReadResourceResult,
  type Root,
  type ServerCapabilities,
} from "@modelcontextprotocol/sdk/types.js";
import ToolManager from "./ToolManager";
import PromptManager from "./PromptManager";
import RootsManager from "./RootsManager";

class EasyMCP {
  name: string;
  opts: ServerOptions;
  resourceManager: ResourceManager;
  toolManager: ToolManager;
  promptManager: PromptManager;
  rootsManager: RootsManager;
  server: Server | null = null;

  private constructor(name: string, opts: ServerOptions) {
    this.name = name;
    this.opts = opts;
    this.resourceManager = ResourceManager.create();
    this.toolManager = ToolManager.create();
    this.promptManager = PromptManager.create();
    this.rootsManager = RootsManager.create();
  }

  registerCapabilities() {
    const capabilities: ServerCapabilities = {};

    if (
      this.resourceManager.listResources().length ||
      this.resourceManager.listTemplates().length
    ) {
      capabilities.resources = {};
    }

    if (this.toolManager.list().length) {
      capabilities.tools = {};
    }

    if (this.promptManager.list().length) {
      capabilities.prompts = {};
    }

    if (this.rootsManager.list().length) {
      capabilities.roots = {};
    }
    // samplings: {},
    // experimental: {},

    return {
      capabilities,
    };
  }

  async serve() {
    try {
      console.log(`Starting server ${this.name} with options:`, this.opts);
      const transport = new StdioServerTransport();
      this.server = new Server(
        {
          name: this.name,
          version: this.opts.version,
        },
        this.registerCapabilities(),
      );
      await this.registerCoreHandlers();
      await this.server.connect(transport);
      console.log("Server started");
    } catch (e) {
      console.error("Error starting server", e);
      process.exit(1);
    }
  }

  tool(config: ToolConfig) {
    return this.toolManager.add(config);
  }

  resource(config: ResourceConfig) {
    return this.resourceManager.addResource({
      uri: config.uri,
      name: config.name,
      description: config.description,
      mimeType: config.mimeType,
      fn: config.fn,
    });
  }

  template(config: ResourceTemplateConfig) {
    return this.resourceManager.addTemplate({
      uriTemplate: config.uriTemplate,
      name: config.name,
      description: config.description,
      mimeType: config.mimeType,
      fn: config.fn,
    });
  }

  prompt(config: PromptConfig) {
    return this.promptManager.add(config);
  }

  root(config: Root) {
    return this.rootsManager.add(config);
  }

  private async registerCoreHandlers() {
    if (!this.server) {
      throw new Error("Server not initialized. Call serve() first.");
    }

    // Resources
    this.server.setRequestHandler(
      ListResourcesRequestSchema,
      async (): Promise<ListResourcesResult> => {
        return { resources: this.resourceManager.listResources() };
      },
    );
    console.log("Registered ListResources endpoint");

    this.server.setRequestHandler(
      ListResourceTemplatesRequestSchema,
      async (): Promise<ListResourceTemplatesResult> => {
        return { resourceTemplates: this.resourceManager.listTemplates() };
      },
    );

    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request: ReadResourceRequest): Promise<ReadResourceResult> => {
        try {
          const resourceResult = await this.resourceManager.get(
            request.params.uri,
          );
          return resourceResult;
        } catch (e) {
          if (e instanceof ResourceNotFoundError) {
            return {
              contents: [
                {
                  uri: request.params.uri,
                  mimeType: "text/plain",
                  text: "Resource not found",
                },
              ],
            };
          }
          throw new ResourceError((e as unknown as Error).message);
        }
      },
    );
    console.log("Registered ReadResource endpoint");

    // Tools
    this.server.setRequestHandler(
      ListToolsRequestSchema,
      async (): Promise<ListToolsResult> => {
        return { tools: this.toolManager.list() };
      },
    );
    console.log("Registered ListTools endpoint");

    this.server.setRequestHandler(
      CallToolRequestSchema,
      async ({ params }): Promise<CallToolResult> => {
        const result = await this.toolManager.call(
          params.name,
          params.arguments,
        );
        return {
          content: [
            {
              type: "text",
              text: result,
            },
          ],
        };
      },
    );
    console.log("Registered CallTool endpoint");

    // Prompts
    this.server.setRequestHandler(
      ListPromptsRequestSchema,
      async (): Promise<ListPromptsResult> => {
        return { prompts: this.promptManager.list() };
      },
    );
    console.log("Registered ListPrompts endpoint");

    this.server.setRequestHandler(
      GetPromptRequestSchema,
      async ({ params }): Promise<GetPromptResult> => {
        const result = await this.promptManager.call(
          params.name,
          params.arguments,
        );
        return {
          messages: [
            {
              role: "user",
              content: { type: "text", text: result },
            },
          ],
        };
      },
    );
    console.log("Registered GetPrompt endpoint");

    // Roots
    this.server.setRequestHandler(
      ListRootsRequestSchema,
      async (): Promise<ListRootsResult> => {
        return { roots: this.rootsManager.list() };
      },
    );
    console.log("Registered ListRoots endpoint");
  }

  static create(name: string, opts: ServerOptions) {
    return new EasyMCP(name, opts);
  }
}

export default EasyMCP;
