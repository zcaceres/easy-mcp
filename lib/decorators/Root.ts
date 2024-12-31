import type { Root } from "@modelcontextprotocol/sdk/types.js";
import { metadataKey } from "../MagicConfig";

export function Root(config: { uri: string }) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    const rootConfig: Root = {
      name: propertyKey,
      uri: config.uri,
    };

    /**
    We add the Root configuration to the original method so that it lives on the functions prototype.

    When we instantiate the class later, we have access to this config which we can then use to register the Root with the Root Manager.
    */

    if (!originalMethod[metadataKey]) {
      originalMethod[metadataKey] = {};
    }

    if (rootConfig) {
      originalMethod[metadataKey].rootConfig = rootConfig;
    }

    return descriptor;
  };
}
