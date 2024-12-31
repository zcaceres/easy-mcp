import { extractFunctionMetadata, metadataKey } from "../MagicConfig";
import type {
  FunctionConfig,
  MimeTypes,
  ResourceConfig,
  ResourceTemplateConfig,
} from "../../types";

type ResourceDecoratorConfig = FunctionConfig &
  (
    | { uri: string; mimeType?: MimeTypes }
    | { uriTemplate: string; mimeType?: MimeTypes }
  );

export function Resource(config: ResourceDecoratorConfig) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    const metadata = extractFunctionMetadata(target, propertyKey, config);

    let resourceConfig: ResourceConfig | null = null;
    let templateConfig: ResourceTemplateConfig | null = null;

    if ("uri" in config) {
      resourceConfig = {
        uri: config.uri,
        name: metadata.name,
        description: metadata.description || "",
        mimeType: config.mimeType || ("text/plain" as const),
        // MCP passes in an arguments OBJECT to the function, so we need to convert that back to the parameters the function expects.
        fn: (argsObject) => {
          if (argsObject) {
            return originalMethod(...Object.values(argsObject));
          }
          return originalMethod();
        },
      };
    } else if ("uriTemplate" in config) {
      // Create a ResourceTemplateConfig object
      templateConfig = {
        uriTemplate: config.uriTemplate,
        name: metadata.name,
        description: metadata.description || "",
        mimeType: config.mimeType || ("text/plain" as const),
        // MCP passes in an arguments OBJECT to the function, so we need to convert that back to the parameters the function expects.
        fn: (argsObject) => {
          if (argsObject) {
            return originalMethod(...Object.values(argsObject));
          }
          return originalMethod();
        },
      };
    } else {
      throw new Error(
        "Invalid resource config passed to Decorator. Must have either uri or uriTemplate.",
      );
    }

    /**
    We add the Resource configuration to the original method so that it lives on the functions prototype.

    When we instantiate the class later, we have access to this config which we can then use to register the Resource with the Resource Manager.
    */

    if (!originalMethod[metadataKey]) {
      originalMethod[metadataKey] = {};
    }

    if (resourceConfig) {
      originalMethod[metadataKey].resourceConfig = resourceConfig;
    }

    if (templateConfig) {
      originalMethod[metadataKey].resourceTemplateConfig = templateConfig;
    }

    return descriptor;
  };
}
