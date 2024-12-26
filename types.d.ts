import type { Resource, Tool } from "@modelcontextprotocol/sdk/types.js";

export type ServerOptions = {
  version: `${number}.${number}.${number}`;
};

export type EasyMCPResource = Resource & {
  fn: ResourceRequestFn;
};

export type MCPResourceRequestParams = Record<string, string>;

export type ResourceOptions = Partial<{
  name: string;
  description: string;
  mimeType: string;
}>;

export type ResourceRequestFn = (
  params: MCPResourceRequestParams,
  context: ResourceRequestContext,
) => Promise<any>;

export type ResourceRequestContext = {
  uri: string;
  getResource: (uri: string) => Promise<any>;
};

export type ToolRequestFn = (params?: any) => Promise<any>;

export type ToolOptions = Pick<Tool, "inputSchema" | "description">;

export type EasyMCPTool = Tool & {
  fn: ToolRequestFn;
};
