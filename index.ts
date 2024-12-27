import EasyMCP from "./lib/EasyMCP";

const mcp = EasyMCP.create("test-mcp", {
  version: "0.1.0",
});

mcp.resource({
  uri: "dir://desktop",
  name: "Desktop",
  description: "The desktop",
  mimeType: "text/plain",
  fn: async () => {
    return "file://desktop/file1.txt";
  },
});

mcp.template({
  uriTemplate: "file://{filename}",
  fn: async ({ filename }) => {
    return `file://${filename}/file1.txt`;
  },
});

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

mcp.prompt({
  name: "Hello World Prompt",
  description: "A prompt that says hello",
  // TODO: find a way to infer the args from the parameters input to fn below, so we don't have to explicitly define them here.
  args: [
    {
      name: "name",
      type: "string",
      description: "Your name",
      required: true,
    },
  ],
  fn: async ({ name }: { name: string }) => {
    return `Hello, ${name}!`;
  },
});

await mcp.serve().catch(console.error);
