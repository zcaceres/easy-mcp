import { MagicInference } from "../MagicConfig";
import type { FunctionConfig, PromptConfig } from "../../types";
import BaseMCP from "../EasyMCP";
import { getFunctionMetadata } from "../Metadata";

export function Prompt(config: FunctionConfig) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    // Apply MagicInference decorator
    MagicInference(config)(target, propertyKey, descriptor);

    // Get the original method
    const originalMethod = descriptor.value;

    // Replace the method with a new one that registers the prompt
    descriptor.value = function (...args: any[]) {
      // Get the metadata added by MagicInference
      const metadata = getFunctionMetadata(this, originalMethod);

      if (!metadata) {
        throw new Error("Metadata not found for the decorated method");
      }

      // Create a PromptConfig object
      const promptConfig: PromptConfig = {
        name: metadata.name,
        description: metadata.description || "",
        args: metadata.parameters.map((param) => ({
          name: param.name,
          type: param.type,
          description: "", // You might want to add a way to specify parameter descriptions
          required: !param.optional,
        })),
        fn: originalMethod.bind(this),
      };

      // Add the prompt to the PromptManager
      if (this instanceof BaseMCP) {
        this.promptManager.add(promptConfig);
      } else {
        console.warn(
          "The @Prompt decorator should be used within a BaseMCP class",
        );
      }

      // Call the original method
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
