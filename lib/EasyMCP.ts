import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type {
  PromptConfig,
  ResourceConfig,
  ResourceTemplateConfig,
  ServerOptions,
  ToolConfig,
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
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  type CallToolResult,
  type GetPromptResult,
  type ListPromptsResult,
  type ListResourcesResult,
  type ListResourceTemplatesResult,
  type ListToolsResult,
  type ReadResourceRequest,
  type ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";
import ToolManager from "./ToolManager";
import PromptManager from "./PromptManager";

class EasyMCP {
  name: string;
  opts: ServerOptions;
  resourceManager: ResourceManager;
  toolManager: ToolManager;
  promptManager: PromptManager;
  server: Server;

  private constructor(name: string, opts: ServerOptions) {
    this.name = name;
    this.opts = opts;
    this.resourceManager = ResourceManager.create();
    this.toolManager = ToolManager.create();
    this.promptManager = PromptManager.create();
    this.server = new Server(
      {
        name: this.name,
        version: this.opts.version,
      },
      // @TODO: Figure out how to expose capabilities based on the handlers registered
      {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
          roots: {},
          samplings: {},
          experimental: {},
        },
      },
    );
  }

  async serve() {
    try {
      console.log(`Starting server ${this.name} with options:`, this.opts);
      const transport = new StdioServerTransport();
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
    });
  }

  prompt(config: PromptConfig) {
    return this.promptManager.add(config);
  }

  private async registerCoreHandlers() {
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
  }

  static create(name: string, opts: ServerOptions) {
    return new EasyMCP(name, opts);
  }
}

export default EasyMCP;
