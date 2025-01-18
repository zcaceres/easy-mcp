import BaseMCP from "./lib/EasyMCP";

const mcp = BaseMCP.create("test-mcp", {
  version: "0.1.0",
});

mcp.resource({
  uri: "dir://desktop",
  name: "An optional name", // Optional
  description: "An optional description", // Optional
  mimeType: "text/plain", // optional
  fn: async () => {
    return "file://desktop/file1.txt";
  },
});

mcp.template({
  uriTemplate: "file://{filename}/{id}",
  name: "An optional name", // Optional
  description: "An optional description", // Optional
  mimeType: "text/plain", // Optional
  fn: addMetadata(
    async ({ filename, id }: { filename: string; id: string }) => {
      return `file://${filename}/${id}.txt`;
    },
  ),
});

function addMetadata(fn: Function) {
  return function (...args: any[]) {
    // Here you can add logic to parse the function and add metadata
    return fn(...args);
  };
}

mcp.tool({
  name: "hello world",
  inputs: [
    {
      name: "optionalInput",
      type: "string",
      description: "an optional input",
      required: false,
    },
  ],
  fn: async ({ optionalInput }) => {
    return `Hello, ${optionalInput}!`;
  },
});

mcp.prompt({
  name: "Hello World Prompt",
  description: "A prompt that says hello",
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

mcp.root({
  name: "Optional Name",
  uri: "/Users/username/Desktop",
});

await mcp.serve().catch(console.error);
