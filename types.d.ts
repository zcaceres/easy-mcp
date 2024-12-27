import type {
  PromptArgument,
  Resource,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

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

// export type ToolRequestFn = (params?: any) => Promise<any>;

// export type ToolOptions = Pick<Tool, "inputSchema" | "description">;

// export type EasyMCPTool = Tool & {
//   fn: ToolFn;
// };
//

export type ToolInputSchema = {
  type: "object";
  properties: {
    [key: string]: {
      type: string;
      description: string;
    };
  };
  required: string[];
};

export type ToolDefinition = {
  name: string;
  description: string;
  input_schema: ToolInputSchema;
} & {
  cache_control?: {
    type: "ephemeral";
  };
};

export type FulfillmentFn = (...args: any[]) => Promise<any>;

export type ToolConfig = {
  name: string;
  description?: string;
  inputs?: ToolArg[];
  fn: FulfillmentFn;
};

export type ToolArg = {
  name: string;
  type: "string" | "number" | "array" | "object";
  description: string;
  required?: boolean;
};

export type SerializableTool = {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
};

export type PromptDefinition = {
  name: string;
  description: string;
  arguments: PromptArgument[];
};

export type PromptConfig = {
  name: string;
  description: string;
  args: PromptArgument[];
  fn: FullfillmentFn;
};
