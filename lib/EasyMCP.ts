import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type {
  MCPResourceRequestParams,
  ResourceOptions,
  ServerOptions,
} from "../types";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import ResourceManager, {
  ResourceError,
  ResourceNotFoundError,
} from "./ResourceManager";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  type ReadResourceRequest,
  type ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";

class EasyMCP {
  name: string;
  opts: ServerOptions;
  resourceManager: ResourceManager;
  server: Server;

  private constructor(name: string, opts: ServerOptions) {
    this.name = name;
    this.opts = opts;
    this.resourceManager = ResourceManager.create();
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

  resource(
    uri: string,
    fn: (params: MCPResourceRequestParams) => Promise<any>,
    opts: ResourceOptions = {},
  ) {
    return this.resourceManager.add(
      {
        uri,
        name: opts.name ? opts.name : uri,
        description: opts?.description,
        mimeType: opts?.mimeType,
      },
      fn,
    );
  }

  private async registerCoreHandlers() {
    // Resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return { resources: this.resourceManager.list() };
    });
    console.log("Registered ListResources endpoint");

    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request: ReadResourceRequest) => {
        try {
          const resourceResult = await this.resourceManager.get(
            request.params.uri,
          );
          // ReadResourceResult is basically an any
          return resourceResult as ReadResourceResult;
        } catch (e) {
          if (e instanceof ResourceNotFoundError) {
            return { error: e.message };
          }
          throw new ResourceError((e as unknown as Error).message);
        }
      },
    );
    console.log("Registered ReadResource endpoint");
  }

  static create(name: string, opts: ServerOptions) {
    return new EasyMCP(name, opts);
  }
}

export default EasyMCP;
