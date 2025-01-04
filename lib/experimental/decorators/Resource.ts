import { extractFunctionMetadata, metadataKey } from "../MagicConfig";
import type {
  ResourceConfig,
  ResourceDefinition,
  ResourceTemplateConfig,
} from "../../../types";

export function Resource(
  uriOrUriTemplate: string,
  config: Partial<ResourceDefinition> = {},
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    const metadata = extractFunctionMetadata(target, propertyKey, config);

    let resourceConfig: ResourceConfig | null = null;
    let templateConfig: ResourceTemplateConfig | null = null;

    // Check whether the uri is a uri or a uriTemplate
    if (uriOrUriTemplate.includes("{")) {
      // Create a ResourceTemplateConfig object
      templateConfig = {
        uriTemplate: uriOrUriTemplate,
        name: config.name || metadata.name,
        description:
          config.description ||
          metadata.description ||
          `a resource with name ${metadata.name} at uri ${uriOrUriTemplate}`,
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
      resourceConfig = {
        uri: uriOrUriTemplate,
        name: config.name || metadata.name,
        description:
          config.description ||
          metadata.description ||
          `a resource with name ${metadata.name} at uri ${uriOrUriTemplate}`,
        mimeType: config.mimeType || ("text/plain" as const),
        // MCP passes in an arguments OBJECT to the function, so we need to convert that back to the parameters the function expects.
        fn: (argsObject) => {
          if (argsObject) {
            return originalMethod(...Object.values(argsObject));
          }
          return originalMethod();
        },
      };
    }

    /**
      We add the Resource configuration to the original method so that  it lives on the functions prototype.

      When we instantiate the class later, we have access to this   config which we can then use to register the Resource with the  Resource Manager.
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
