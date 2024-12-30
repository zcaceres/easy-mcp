import EasyMCP from "./EasyMCP";
import { Tool } from "./decorators/Tool";

class MCP extends EasyMCP {
  @Tool({})
  add({ name, age }: { name: string; age: number }) {
    console.log(`${name} of ${age} age`);
  }

  @Tool({
    description: "A function with various parameter types",
    optionalParameters: ["active", "items", "age"],
  })
  exampleFunc(name: string, active?: string, items?: string[], age?: number) {
    return `exampleFunc called: ${name}, ${active}, ${items}, ${age}`;
  }
}

// Usage
const mcp = new MCP();

// The @Tool decorator will automatically add the tool to the toolManager
// This shows tool in tools
console.log("MCP:", mcp);
// This does not show any tools
console.log("Tools:", mcp.toolManager.list());

// Start the server
// mcp.serve().catch(console.error);

/**
At runtime... the @Tool decorator runs.

EXTRACT CONFIG
It extracts metadata from the function

ADD CONFIG
a tool configuration to the MCP's tool manager member variable.

The method becomes the "fn" registered in the tool manager.

We're done!
*/
/**

At runtime... the @tool decorator runs.

EXTRACT CONFIG
It extracts metadata from the function

ADD CONFIG
a tool configuration to the MCP's tool manager member variable.

The method becomes the "fn" registered in the tool manager.

We're done!
*/
