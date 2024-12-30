import type { Root } from "@modelcontextprotocol/sdk/types.js";
import BaseMCP from "../EasyMCP";

export function Root(config: { uri: string }) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const rootConfig: Root = {
        name: propertyKey,
        uri: config.uri,
      };

      if (this instanceof BaseMCP) {
        this.rootsManager.add(rootConfig);
      } else {
        console.warn(
          "The @Root decorator should be used within a BaseMCP class",
        );
      }

      // Call the original method
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
