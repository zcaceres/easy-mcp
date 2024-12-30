import BaseMCP from "./lib/EasyMCP";

const mcp = BaseMCP.create("test-mcp", {
  version: "0.1.0",
});

mcp.resource({
  uri: "dir://desktop",
  fn: async () => {
    return "file://desktop/file1.txt";
  },
});

mcp.template({
  uriTemplate: "file://{parameter1}/{parameter2}",
  fn: async ({ filename }) => {
    return `file://${filename}/file1.txt`;
  },
});

mcp.tool({
  name: "hello world",
  fn: async () => {
    return `Hello, world!`;
  },
});

mcp.prompt({
  name: "Hello World Prompt",
  fn: async ({ name }: { name: string }) => {
    return `Hello, world!`;
  },
});

mcp.root({
  uri: "/Users/username/Desktop",
});

await mcp.serve().catch(console.error);
