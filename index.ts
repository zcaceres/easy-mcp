import EasyMCP from "./lib/EasyMCP";
// import type { ResourceRequestContext } from "./types";

const mcp = EasyMCP.create("test-mcp", {
  version: "0.1.0",
});

// mcp.resource(
//   "file://:fileName/:id",
//   async ({ fileName, id }, ctx: ResourceRequestContext) => {
//     // const resource = ctx.getResource(`file://${fileName}`);
//     return {
//       contents: [
//         {
//           uri: "whatever",
//           type: "text",
//           text: `File: ${fileName} with ID: ${id}`,
//         },
//       ],
//     };
//   },
// );
//

mcp.tool({
  name: "hello world",
  inputs: [
    {
      name: "name",
      type: "string",
      description: "Your name",
      required: true,
    },
  ],
  fn: async ({ name }) => {
    return `Hello, ${name}!`;
  },
});

await mcp.serve().catch(console.error);
