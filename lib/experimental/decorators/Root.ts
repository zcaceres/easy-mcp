/**
 * All other decorators wrap instance methods. This decorator wraps the class itself because Roots do not have logic or function params when they're fulfilled.
 */
export function Root(
  uri: string,
  config: { name?: string } = { name: undefined },
) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    if (!constructor.hasOwnProperty("rootConfigs")) {
      Object.defineProperty(constructor, "rootConfigs", {
        value: [],
        writable: true,
        configurable: true,
      });
    }

    (constructor as any).rootConfigs.push({
      uri,
      name: config.name || constructor.name,
    });

    return constructor;
  };
}
