import EasyMCP from "./lib/EasyMCP";

EasyMCP.create("test-mcp", {
  version: "0.1.0",
})
  .then((mcp) => mcp.serve())
  .catch(console.error);
