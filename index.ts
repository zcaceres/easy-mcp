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
  async () => {
    return "Hello World";
  },
  {
    description: "Hello world function",
  },
);

await mcp.serve().catch(console.error);
