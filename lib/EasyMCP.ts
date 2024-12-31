import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type {
  PromptConfig,
  ResourceConfig,
  ResourceTemplateConfig,
  ServerOptions,
  ToolConfig,
  Version,
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
import { metadataKey } from "./MagicConfig";

class BaseMCP {
  name: string;
  opts: ServerOptions;
  resourceManager: ResourceManager;
  toolManager: ToolManager;
  promptManager: PromptManager;
  rootsManager: RootsManager;
  server: Server | null = null;

  constructor(name: string, opts: ServerOptions) {
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
    return new BaseMCP(name, opts);
  }
}

export default class EasyMCP extends BaseMCP {
  constructor({
    version,
    description,
  }: {
    version: Version;
    description?: string;
  }) {
    // This call should initialize all the managers
    super("", { version, description });
    this.name = this.constructor.name;

    // Handle class-level Root decorators
    const rootConfigs = (this.constructor as any).rootConfigs;
    if (rootConfigs && Array.isArray(rootConfigs)) {
      rootConfigs.forEach((rootConfig) => {
        this.root(rootConfig);
      });
    }

    const childMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter((method) => typeof this[method] === "function")
      .filter(
        (method) =>
          !Object.getOwnPropertyNames(
            Object.getPrototypeOf(BaseMCP.prototype),
          ).includes(method),
      );

    childMethods.forEach((method) => {
      // Assuming the decorator has been run to wrap these functions, we should have one of these configs on the relevant method.
      // @ts-expect-error Due to decorator behavior we're doing some JS prototype hacking that triggers a TS error here
      if (this[method][metadataKey].toolConfig) {
        // @ts-expect-error Due to decorator behavior we're doing some JS prototype hacking that triggers a TS error here
        this.tool(this[method][metadataKey].toolConfig);
      }

      // @ts-expect-error Due to decorator behavior we're doing some JS prototype hacking that triggers a TS error here
      if (this[method][metadataKey].promptConfig) {
        // @ts-expect-error Due to decorator behavior we're doing some JS prototype hacking that triggers a TS error here
        this.prompt(this[method][metadataKey].promptConfig);
      }
      // @ts-expect-error Due to decorator behavior we're doing some JS prototype hacking that triggers a TS error here
      if (this[method][metadataKey].rootConfig) {
        // @ts-expect-error Due to decorator behavior we're doing some JS prototype hacking that triggers a TS error here
        this.root(this[method][metadataKey].rootConfig);
      }

      // @ts-expect-error Due to decorator behavior we're doing some JS prototype hacking that triggers a TS error here
      if (this[method][metadataKey].resourceConfig) {
        // @ts-expect-error Due to decorator behavior we're doing some JS prototype hacking that triggers a TS error here
        this.resource(this[method][metadataKey].resourceConfig);
      }

      // @ts-expect-error Due to decorator behavior we're doing some JS prototype hacking that triggers a TS error here
      if (this[method][metadataKey].resourceTemplateConfig) {
        // @ts-expect-error Due to decorator behavior we're doing some JS prototype hacking that triggers a TS error here
        this.template(this[method][metadataKey].resourceTemplateConfig);
      }
    });

    this.serve();
  }
}
