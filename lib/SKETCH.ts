import EasyMCP from "./EasyMCP";
import { Prompt } from "./decorators/Prompt";
import { Resource } from "./decorators/Resource";
import { Root } from "./decorators/Root";
import { Tool } from "./decorators/Tool";

@Root({
  uri: "my sample root",
})
class ZachsMCP extends EasyMCP {
  @Tool({})
  addNum({ name, age }: { name: string; age: number }) {
    console.log(`${name} of ${age} age`);
  }

  @Tool({
    description: "A function with various parameter types",
    optionalParameters: ["active", "items", "age"],
  })
  exampleFunc(name: string, active?: string, items?: string[], age?: number) {
    return `exampleFunc called: name ${name}, active ${active}, items ${items}, age ${age}`;
  }

  @Resource({
    uri: "hello-world",
  })
  helloWorld() {
    return "Hello, world!";
  }

  @Resource({
    uriTemplate: "greeting/{name}",
  })
  greeting(name: string) {
    return `Hello, ${name}!`;
  }

  @Prompt({
    name: "prompt test",
    description: "test",
  })
  myPrompt(name: string) {
    return `Prompting... ${name}`;
  }
}

const mcp = new ZachsMCP({ version: "1.0.0" });

mcp.root({
  uri: "/",
  resource: "hello",
});

mcp.serve();

console.dir(mcp);
