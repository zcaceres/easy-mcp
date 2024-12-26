import type { Resource } from "@modelcontextprotocol/sdk/types.js";

export type ServerOptions = {
  version: `${number}.${number}.${number}`;
};

export type EasyMCPResource = Resource & {
  fn: Function;
};

export type MCPResourceRequestParams = Record<string, string>;

export type ResourceOptions = Partial<{
  name: string;
  description: string;
  mimeType: string;
}>;
