# easy-mcp

> EasyMCP is usable but in beta. Please report any issues you encounter.

Easy MCP is the simplest way to create Model Context Protocol (MCP) servers in TypeScript.

It hides the plumbing, formatting, and other boilerplate definitions behind simple decorators that wrap a function.

Easy MCP allows you to define the bare minimum of what you need to get started, or you can define more complex resources, templates, tools, and prompts.

## Features

- Define @Tools, @Prompts, @Resources, and @Roots with one call to a decorator. Every possible parameter that could be optional is optional and hidden unless you need it.
- Automagically infers tool, prompt, and resource arguments. No input schema definition required!

## Installation

To install easy-mcp, run the following command in your project directory:

```bash
pnpm install easy-mcp
```

Or if you're using bun:

```bash
bun add easy-mcp
```

## Limitations

- No support for logging, yet
- No support for sampling, yet
- No support for SSE, yet

## Usage with (Experimental) Decorators API

This API is simpler and infers types and input configuration automatically. But it's experimental and may change or have not-yet-discovered problems.

```typescript
import EasyMCP from "./lib/EasyMCP";
import { Prompt } from "./lib/decorators/Prompt";
import { Resource } from "./lib/decorators/Resource";
import { Root } from "./lib/decorators/Root";
import { Tool } from "./lib/decorators/Tool";

@Root("/my-sample-dir/photos")
// Optionally include a name for the Root
@Root("/my-root-dir", { name: "My laptop's root directory" })
class ZachsMCP extends EasyMCP {
  /**
  You can declare a with zero configuration. Relevant types and plumbing will be inferred and handled.

  By default, the *name* of the Tool will be the name of the method.
  */
  @Tool()
  simpleFunc(nickname: string, height: number) {
    return `${nickname} of ${height} height`;
  }

  /**
   * You can enhance a tool with optional data like a description.

   Due to limitations in Typescript, if you want the Tool to serialize certain inputs as optional to the Client, you need to provide an optionals list.
   */
  @Tool({
    description: "An optional description",
    optionals: ["active", "items", "age"],
  })
  middleFunc(name: string, active?: string, items?: string[], age?: number) {
    return `exampleFunc called: name ${name}, active ${active}, items ${items}, age ${age}`;
  }

  /**
   * You can also provide a schema for the input arguments of a tool, if you want full control.
   */
  @Tool({
    description: "A function with various parameter types",
    parameters: [
      {
        name: "date",
        type: "string",
        optional: false,
      },
      {
        name: "season",
        type: "string",
        optional: false,
      },
      {
        name: "year",
        type: "number",
        optional: true,
      },
    ],
  })
  complexTool(date: string, season: string, year?: number) {
    return `complexTool called: date ${date}, season ${season}, year ${year}`;
  }

  /**
   * Resources can be declared with a simple URI.

   By default, the name of the resource will be the name of the method.
   */
  @Resource("simple-resource")
  simpleResource() {
    return "Hello, world!";
  }

  /**
   * Or include handlebars which EasyMCP will treat as a Resource Template.

   Both Resources and Resource Templates can be configured with optional data like a description.
   */
  @Resource("greeting/{name}")
  myResourceTemplate(name: string) {
    return `Hello, ${name}!`;
  }

  /**
   * By default, prompts need no configuration.

   They will be named after the method they decorate.
   */
  @Prompt()
  simplePrompt(name: string) {
    return `Prompting... ${name}`;
  }

  /**
   * Or you can override and configure a Prompt with a name, description, and explicit arguments.
   */
  @Prompt({
    name: "configured-prompt",
    description: "A prompt with a name and description",
    args: [
      {
        name: "name",
        description: "The name of the thing to prompt",
        required: true,
      },
    ],
  })
  configuredPrompt(name: string) {
    return `Prompting... ${name}`;
  }
}

const mcp = new ZachsMCP({ version: "1.0.0" });
console.log(mcp.name, "is now serving!");

```


## Usage with Express-like API

Here's a basic example of how to use easy-mcp:

```typescript
import EasyMCP from "easy-mcp";

const mcp = EasyMCP.create("my-mcp-server", {
  version: "0.1.0",
});

// Define a resource
mcp.resource({
  uri: "dir://desktop",
  name: "Desktop Directory", // Optional
  description: "Lists files on the desktop", // Optional
  mimeType: "text/plain", // Optional
  fn: async () => {
    return "file://desktop/file1.txt\nfile://desktop/file2.txt";
  },
});

// Define a resource template
mcp.template({
  uriTemplate: "file://{filename}",
  name: "File Template", // Optional
  description: "Template for accessing files", // Optional
  mimeType: "text/plain", // Optional
  fn: async ({ filename }) => {
    return `Contents of ${filename}`;
  },
});

// Define a tool
mcp.tool({
  name: "greet",
  description: "Greets a person", // Optional
  inputs: [ // Optional
    {
      name: "name",
      type: "string",
      description: "The name to greet",
      required: true,
    },
  ],
  fn: async ({ name }) => {
    return `Hello, ${name}!`;
  },
});

// Define a prompt
mcp.prompt({
  name: "introduction",
  description: "Generates an introduction", // Optional
  args: [ // Optional
    {
      name: "name",
      type: "string",
      description: "Your name",
      required: true,
    },
  ],
  fn: async ({ name }) => {
    return `Hi there! My name is ${name}. It's nice to meet you!`;
  },
});

// Start the server
mcp.serve().catch(console.error);
```

## API

### `EasyMCP.create(name: string, options: ServerOptions)`

Creates a new EasyMCP instance.

- `name`: The name of your MCP server.
- `options`: Server options, including the version.

### `mcp.resource(config: ResourceConfig)`

Defines a resource.

### `mcp.template(config: ResourceTemplateConfig)`

Defines a resource template.

### `mcp.tool(config: ToolConfig)`

Defines a tool.

### `mcp.prompt(config: PromptConfig)`

Defines a prompt.

### `mcp.root(config: Root)`

Defines a root.

### `mcp.serve()`

Starts the MCP server.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Credits

Easy MCP was created by Zach Caceres but inspired by [FastMCP by kjlowin](https://github.com/jlowin/fastmcp), a library for Python MCP servers.
