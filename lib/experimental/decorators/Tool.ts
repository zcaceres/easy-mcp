import type { FunctionConfig, ToolConfig } from "../../../types";
import type { Context } from "../../Context";
import { extractFunctionMetadata, metadataKey } from "../MagicConfig";

export function Tool(config?: FunctionConfig) {
  return function (...args: any[]) {
    const [target, propertyKey, descriptor] = args;

    // If it's not a method decorator, return
    if (args.length < 2) {
      return;
    }

    const originalMethod = descriptor.value;

    const metadata = extractFunctionMetadata(target, propertyKey, config || {});

    if (!config) {
      config = {
        name: propertyKey,
        description: `A tool that accepts parameters: ${metadata.parameters.map((param) => `${param.name} of type ${param.type}`)}`,
      };
    }

    const inputConfigSource = config.parameters
      ? config.parameters
      : metadata.parameters;

    const toolConfig: ToolConfig = {
      name: propertyKey,
      description: config.description || "",
      inputs: inputConfigSource.map((param) => ({
        name: param.name,
        type: param.type,
        description:
          param.description ||
          `a param named ${param.name} of type ${param.type}`,
        required: !param.optional,
      })),
      // MCP passes in an arguments OBJECT to the function, so we need to convert that back to the parameters the function expects.
      fn: (argsObject: any, context?: Context) => {
        if (argsObject) {
          return originalMethod.call(
            target,
            ...Object.values(argsObject),
            context,
          );
        }
        return originalMethod.call(target, context);
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

    // Return the original descriptor
    return descriptor;
  };
}

//   return function (
//     target: any,
//     propertyKey: string,
//     descriptor: PropertyDescriptor,
//   ): PropertyDescriptor | void {
//     const originalMethod = descriptor.value;

//     const metadata = extractFunctionMetadata(target, propertyKey, config || {});

//     if (!config) {
//       config = {
//         name: propertyKey,
//         description: `A tool that accepts parameters: ${metadata.parameters.map((param) => `${param.name} of type ${param.type}`)}`,
//       };
//     }

//     const inputConfigSource = config.parameters
//       ? config.parameters
//       : metadata.parameters;

//     const toolConfig: ToolConfig = {
//       name: propertyKey,
//       description: config.description || "",
//       inputs: inputConfigSource.map((param) => ({
//         name: param.name,
//         type: param.type,
//         description:
//           param.description ||
//           `a param named ${param.name} of type ${param.type}`,
//         required: !param.optional,
//       })),
//       // MCP passes in an arguments OBJECT to the function, so we need to convert that back to the parameters the function expects.
//       fn: (argsObject: any, context?: Context) => {
//         if (argsObject) {
//           return originalMethod.call(
//             target,
//             ...Object.values(argsObject),
//             context,
//           );
//         }
//         return originalMethod.call(target, context);
//       },
//     };

//     /**
//       We add the tool configuration to the original method so that it lives on the functions prototype.

//       When we instantiate the class later, we have access to this config which we can then use to register the tool with the Tool Manager.
//     */
//     if (!originalMethod[metadataKey]) {
//       originalMethod[metadataKey] = {};
//     }
//     originalMethod[metadataKey].toolConfig = toolConfig;

//     // The function itself remains unchanged, except for the metadata we attached to it.
//     return descriptor;
//   };
// }
