import EasyMCP from "./EasyMCP";
import { metadataKey } from "./MagicConfig";
import { Tool } from "./decorators/Tool";

class MCP extends EasyMCP {
  @Tool({})
  addNum({ name, age }: { name: string; age: number }) {
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
const mcp = new MCP({ version: "1.0.0" });

console.dir(mcp);

// The @Tool decorator will automatically add the tool to the toolManager
// This shows tool in tools
// console.log("MCP:", mcp);
// console.log("addNum:", mcp.addNum[metadataKey].toolConfig);

// This does not show any tools... because the tool is never registered
// console.log("Tools:", mcp.toolManager.list());

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

// if (!target.constructor.prototype.tools) {
//   target.constructor.prototype.REGISTERED_TOOLS = [];
// }
// target.constructor.prototype.REGISTERED_TOOLS.push(toolConfig);
//
//
// console.log("descriptor", descriptor);
// console.log("originalMethod", originalMethod);
// console.log("originalMethod[metadataKey]", originalMethod[metadataKey]);

// const parentPrototype = Object.getPrototypeOf(target.constructor).prototype;
// const parentToolMethod = parentPrototype.tool;
// if (parentToolMethod) {
//   console.log("Parent tool method:", parentToolMethod);
// } else {
//   console.log("No tool method found on parent class");
// }

// parentToolMethod(toolConfig);
