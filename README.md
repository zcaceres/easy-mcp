# easy-mcp

The simplest way to run a Model Context Protocol server in Typescript.

## Installation


## Usage

```typescript
import easymcp from "easy-mcp";

const mcp = EasyMCP("server-name", {
  version: "1.0.0",
  ... other options
};

mcp.on("get", (key: string) => {
  return "Hello, world!";
});

mcp.serve();

```

### Capabilities

### Resources

The handler registered for a given path will be called with the parameters from the path.

If you need to access underlying resources like files or databases, you can use the `resource` method.

```typescript
mcp.resource("file://:fileName/:id", async ({ fileName, id }, ctx) => {
  return {
    contents: [
      {
        uri: "whatever",
        type: "text",
        text: `File: ${fileName} with ID: ${id}`,
      },
    ],
  };
});
```

### Tools



```

## Credits

Hat tip to [FastMCP](https://github.com/jlowin/fastmcp)
