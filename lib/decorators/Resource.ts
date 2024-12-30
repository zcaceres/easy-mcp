import { MagicInference } from "../MagicConfig";
import type {
  FunctionConfig,
  MimeTypes,
  ResourceConfig,
  ResourceTemplateConfig,
} from "../../types";
import BaseMCP from "../EasyMCP";
import { getFunctionMetadata } from "../Metadata";

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
    // Apply MagicInference decorator
    MagicInference(config)(target, propertyKey, descriptor);

    // Get the original method
    const originalMethod = descriptor.value;

    // Replace the method with a new one that registers the resource or template
    descriptor.value = function (...args: any[]) {
      // Get the metadata added by MagicInference
      const metadata = getFunctionMetadata(this, originalMethod);

      if (!metadata) {
        throw new Error("Metadata not found for the decorated method");
      }

      if (this instanceof BaseMCP) {
        if ("uri" in config) {
          // Create a ResourceConfig object
          const resourceConfig: ResourceConfig = {
            uri: config.uri,
            name: metadata.name,
            description: metadata.description || "",
            mimeType: config.mimeType || ("text/plain" as const),
            fn: originalMethod.bind(this),
          };

          // Add the resource to the ResourceManager
          this.resourceManager.addResource(resourceConfig);
        } else if ("uriTemplate" in config) {
          // Create a ResourceTemplateConfig object
          const templateConfig: ResourceTemplateConfig = {
            uriTemplate: config.uriTemplate,
            name: metadata.name,
            description: metadata.description || "",
            mimeType: config.mimeType || ("text/plain" as const),
            fn: originalMethod.bind(this),
          };

          // Add the resource template to the ResourceManager
          this.resourceManager.addTemplate(templateConfig);
        } else {
          throw new Error("Invalid Resource decorator configuration");
        }
      } else {
        console.warn(
          "The @Resource decorator should be used within a BaseMCP class",
        );
      }

      // Call the original method
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
