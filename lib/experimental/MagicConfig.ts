import "reflect-metadata";
import type { FunctionConfig, ParameterMetadata } from "../../types";

export const metadataKey = Symbol("functionMetadata");

function getParameterNames(func: Function): (string | null)[] {
  const funcString = func.toString();
  const parameterList = funcString
    .slice(funcString.indexOf("(") + 1, funcString.indexOf(")"))
    .match(/([a-zA-Z0-9_$]+)/g);

  return parameterList || [];
}

export function extractFunctionMetadata(
  target: any,
  propertyKey: string | symbol,
  config: FunctionConfig,
) {
  const parameterTypes: any[] =
    Reflect.getMetadata("design:paramtypes", target, propertyKey) || [];
  const parameterNames = getParameterNames(target[propertyKey]);

  const parameters: ParameterMetadata[] = parameterTypes
    .map((type, index) => {
      const paramName = parameterNames[index] || `arg${index}`;
      const isOptional = config.optionals
        ? config.optionals.includes(paramName)
        : false;

      // Any variable named or typed with EasyMCP's Context type will be caught here
      const isContext = paramName === "context" || type.name === "Context";

      return {
        name: paramName,
        type: type.name.toLowerCase(),
        optional: isOptional,
        isContext: isContext,
      };
    })
    // Filter out context from inpuit schemas so it isn't exposed to the client
    .filter((param) => !param.isContext);

  const metadata = {
    ...config,
    parameters,
    name: propertyKey.toString(),
  };

  Reflect.defineMetadata(metadataKey, metadata, target, propertyKey);

  return metadata;
}
