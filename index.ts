import EasyMCP from "./lib/EasyMCP";
import type { ResourceRequestContext } from "./types";

const mcp = EasyMCP.create("test-mcp", {
  version: "0.1.0",
});

mcp.resource(
  "file://:fileName/:id",
  async ({ fileName, id }, ctx: ResourceRequestContext) => {
    // const resource = ctx.getResource(`file://${fileName}`);
    return {
      contents: [
        {
          uri: "whatever",
          type: "text",
          text: `File: ${fileName} with ID: ${id}`,
        },
      ],
    };
  },
);

// GET file://test.txt/123 <-- this should work
//
//

mcp.tool(
  "hello-world",
  async ({ message }: { message: string }) => {
    return `Hello world: ${message}`;
  },
  {
    description: "Hello world function",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
        },
      },
    },
  },
);

await mcp.serve().catch(console.error);
