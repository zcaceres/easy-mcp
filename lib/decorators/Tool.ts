import type { FunctionConfig, ToolConfig } from "../../types";
import { extractFunctionMetadata, metadataKey } from "../MagicConfig";

export function Tool(config: FunctionConfig) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    // Extract metadata using the shared logic
    const metadata = extractFunctionMetadata(target, propertyKey, config);

    const toolConfig: ToolConfig = {
      name: propertyKey,
      description: config.description || "",
      inputs: metadata.parameters.map((param) => ({
        name: param.name,
        type: param.type,
        description: "", // FIXME
        required: !param.optional,
      })),
      fn: originalMethod,
    };

    if (!target.constructor.prototype.tools) {
      target.constructor.prototype.REGISTERED_TOOLS = [];
    }
    target.constructor.prototype.REGISTERED_TOOLS.push(toolConfig);

    // The descriptor value remains the original method
    return descriptor;
  };
}
