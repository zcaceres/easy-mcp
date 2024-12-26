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

```typescript
mcp.resource("protocol://path-to-resource", params, async (context) => {
  return "Hello, world!";
});

```

## Credits

Hat tip to [FastMCP](https://github.com/jlowin/fastmcp)
