import type { Context } from "../lib/Context";
import BaseMCP from "../lib/EasyMCP";

const mcp = BaseMCP.create("test-mcp", {
  version: "0.1.0",
});

mcp.resource({
  uri: "dir://desktop",
  name: "An optional name", // optional
  description: "An optional description", // optional
  mimeType: "text/plain", // optional
  fn: async () => {
    return "file://desktop/file1.txt";
  },
});

mcp.template({
  uriTemplate: "file://{parameter1}/{parameter2}",
  name: "An optional name", // optional
  description: "An optional description", // optional
  mimeType: "text/plain", // optional
  fn: async ({ filename }) => {
    return `file://${filename}/file1.txt`;
  },
});

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
  fn: async ({ name }, context: Context) => {
    context.info("Hello, world!");
    const resourceContent = await context.readResource("some://resource/uri");
    await context.reportProgress(50, 100);
    return `Hello, ${name}! Resource content: ${resourceContent}`;
  },
});

mcp.tool({
  name: "processData",
  inputs: [
    {
      name: "dataSource",
      type: "string",
      description: "URI of the data source",
      required: true,
    },
  ],
  fn: async ({ dataSource }, context) => {
    context.info(`Starting to process data from ${dataSource}`);

    try {
      const data = await context.readResource(dataSource);
      context.debug("Data loaded");

      // Simulate processing
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await context.reportProgress(i * 20, 100);
        context.info(`Processing step ${i + 1} complete`);
      }

      return `Processed ${data.length} bytes of data from ${dataSource}`;
    } catch (error) {
      context.error(`Error processing data: ${(error as Error).message}`);
      throw error;
    }
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
console.log(mcp.name, "is now serving!");
console.log("It has capabilities:", mcp.listCapabilities());
