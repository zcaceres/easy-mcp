import type { ResourceTemplateCache } from "../types";
import type MCPResourceTemplate from "./MCPResourceTemplate";

export default class URI {
  static extractParamsFromURI(uri: string, template: MCPResourceTemplate) {
    const matcher = URI.createUrlMatcher(template.definition.uriTemplate);
    return URI.matchUrl(uri, matcher);
  }

  static findMatchingTemplate(
    uri: string,
    templates: ResourceTemplateCache,
  ): MCPResourceTemplate | undefined {
    return Object.values(templates).find((r: MCPResourceTemplate) => {
      return this.extractParamsFromURI(uri, r);
    });
  }

  static createUrlMatcher(handlebarPattern: string) {
    const regexPattern = handlebarPattern.replace(/\{(\w+)\}/g, "([^/]+)");
    const regex = new RegExp(`^${regexPattern}$`);

    const keys = [...handlebarPattern.matchAll(/\{(\w+)\}/g)].map((match) => ({
      name: match[1],
    }));

    return { regex, keys };
  }

  static matchUrl(
    url: string,
    matcher: ReturnType<typeof this.createUrlMatcher>,
  ) {
    const { regex, keys } = matcher;
    const match = regex.exec(url);

    if (!match) return null;

    const params: Record<string, string> = {};
    keys.forEach((key, index) => {
      params[key.name] = match[index + 1];
    });

    return params;
  }
}
