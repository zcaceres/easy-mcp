import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { ServerOptions } from "../types";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import ResourceManager from "./ResourceManager";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  type ReadResourceRequest,
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

  private async registerCoreHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: this.resourceManager.list(),
      };
    });
    console.log("Registered ListResources endpoint");

    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request: ReadResourceRequest) => {
        const resource = this.resourceManager.get(request.params.uri);
        if (resource) {
          return { contents: [resource] };
        } else {
          throw new Error("Resource not found");
        }
      },
    );
    console.log("Registered ReadResource endpoint");
  }

  static async create(name: string, opts: ServerOptions) {
    return new EasyMCP(name, opts);
  }
}

export default EasyMCP;
