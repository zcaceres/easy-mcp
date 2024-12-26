import EasyMCP from "./lib/EasyMCP";

const mcp = EasyMCP.create("test-mcp", {
  version: "0.1.0",
});

mcp.resource("file://:fileName/:id", async (params) => {
  const { fileName, id } = params;
  return "Hello, world!";
});

await mcp.serve().catch(console.error);
