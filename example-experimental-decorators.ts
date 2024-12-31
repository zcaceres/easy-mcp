import EasyMCP from "./lib/EasyMCP";
import { Prompt } from "./lib/decorators/Prompt";
import { Resource } from "./lib/decorators/Resource";
import { Root } from "./lib/decorators/Root";
import { Tool } from "./lib/decorators/Tool";

@Root({
  uri: "/my-sample-dir/photos",
})
@Root({
  uri: "/my-root-dir",
  name: "My laptop's root directory",
})
class ZachsMCP extends EasyMCP {
  @Tool({})
  addNum(name: string, age: number) {
    return `${name} of ${age} age`;
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
console.log(mcp.name, "is now serving!");
