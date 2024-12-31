import type { FunctionConfig, ToolConfig } from "../../types";
import { extractFunctionMetadata, metadataKey } from "../MagicConfig";

export function Tool(config: FunctionConfig) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    const metadata = extractFunctionMetadata(target, propertyKey, config);

    const toolConfig: ToolConfig = {
      name: propertyKey,
      description: config.description || "",
      inputs: metadata.parameters.map((param) => ({
        name: param.name,
        type: param.type,
        description: `a ${param.name} of type ${param.type}`, // FIXME
        required: !param.optional,
      })),
      // MCP passes in an arguments OBJECT to the function, so we need to convert that back to the parameters the function expects.
      fn: (argsObject) => {
        if (argsObject) {
          return originalMethod(...Object.values(argsObject));
        }
        return originalMethod();
      },
    };

    /**
      We add the tool configuration to the original method so that it lives on the functions prototype.

      When we instantiate the class later, we have access to this config which we can then use to register the tool with the Tool Manager.
    */
    if (!originalMethod[metadataKey]) {
      originalMethod[metadataKey] = {};
    }
    originalMethod[metadataKey].toolConfig = toolConfig;

    // The function itself remains unchanged, except for the metadata we attached to it.
    return descriptor;
  };
}
