import type { FunctionConfig, PromptConfig } from "../../types";
import { extractFunctionMetadata, metadataKey } from "../MagicConfig";

export function Prompt(config: FunctionConfig) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    const metadata = extractFunctionMetadata(target, propertyKey, config);

    // Create a PromptConfig object
    const promptConfig: PromptConfig = {
      name: metadata.name,
      description: metadata.description || "",
      args: metadata.parameters.map((param) => ({
        name: param.name,
        // In the MCP TS SDK prompt arguments do not have a type, so we don't worry about it here!
        description: "", // You might want to add a way to specify parameter descriptions
        required: !param.optional,
      })),
      fn: (argsObject: any) => {
        if (argsObject) {
          return originalMethod(...Object.values(argsObject));
        }
        return originalMethod();
      },
    };

    /**
    We add the Prompt configuration to the original method so that it lives on the functions prototype.

    When we instantiate the class later, we have access to this config which we can then use to register the Prompt with the Prompt Manager.
    */

    if (!originalMethod[metadataKey]) {
      originalMethod[metadataKey] = {};
    }

    originalMethod[metadataKey].promptConfig = promptConfig;

    return descriptor;
  };
}
