import type { Context } from "./lib/Context";
import EasyMCP from "./lib/EasyMCP";
import { Prompt } from "./lib/experimental/decorators/Prompt";
import { Resource } from "./lib/experimental/decorators/Resource";
import { Root } from "./lib/experimental/decorators/Root";
import { Tool } from "./lib/experimental/decorators/Tool";

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

    Due to limitations in Typescript, if you want the Tool to serialize certain inputs as optional to the Client, you need to provide an optionals list with the name of these parameters.
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

  @Tool({
    description: "A tool that uses context",
  })
  async processData(dataSource: string, context: Context) {
    context.info(`Starting to process data from ${dataSource}`);

    try {
      const data = await context.readResource(dataSource);
      context.debug("Data loaded");

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

const mcp = new ZachsMCP({
  version: "1.0.0",
  description: "A sample MCP with decorators",
});
console.log(mcp.name, "is now serving!");
console.log("It has capabilities:", mcp.listCapabilities());
