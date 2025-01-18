import type {
  PromptArgument,
  Resource,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

export type Version = `${number}.${number}.${number}`;

export type ServerOptions = {
  version: Version;
  description?: string;
};

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

export type FulfillmentFn = (...args: any) => Promise<any>;
export type ToolCallFulfillmentFn = (
  ...args: any,
  context: Context,
) => Promise<any>;

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
  args: PromptArgument[];
};

export type PromptConfig = {
  name: string;
  description?: string;
  args?: PromptArgument[];
  fn: FullfillmentFn;
};

// Resources
export type ResourceConfig = Partial<ResourceDefinition> & {
  uri: string;
  fn: FulfillmentFn;
};

export type ResourceDefinition = {
  uri: string;
  name: string;
  description: string;
  mimeType: MimeTypes;
};

export type ResourceTemplateDefinition = {
  uriTemplate: string;
  name: string;
  description: string;
  mimeType: MimeTypes;
};

export type ResourceTemplateConfig = Partial<ResourceTemplateDefinition> & {
  uriTemplate: string;
  fn: FulfillmentFn;
};

export type ResourceCache = Record<string, MCPResource>;

export type ResourceTemplateCache = Record<string, MCPResourceTemplate>;

export type MimeTypes =
  | "audio/aac"
  | "application/x-abiword"
  | "application/x-freearc"
  | "video/x-msvideo"
  | "application/vnd.amazon.ebook"
  | "application/octet-stream"
  | "image/bmp"
  | "application/x-bzip"
  | "application/x-bzip2"
  | "application/x-csh"
  | "text/css"
  | "text/csv"
  | "application/msword"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/vnd.ms-fontobject"
  | "application/epub+zip"
  | "application/gzip"
  | "image/gif"
  | "text/html"
  | "image/vnd.microsoft.icon"
  | "text/calendar"
  | "application/java-archive"
  | "image/jpg"
  | "image/jpeg"
  | "text/javascript"
  | "application/javascript"
  | "application/json"
  | "application/ld+json"
  | "audio/midi"
  | "audio/mpeg"
  | "video/mpeg"
  | "application/vnd.apple.installer+xml"
  | "application/vnd.oasis.opendocument.presentation"
  | "application/vnd.oasis.opendocument.spreadsheet"
  | "application/vnd.oasis.opendocument.text"
  | "audio/ogg"
  | "video/ogg"
  | "application/ogg"
  | "audio/opus"
  | "font/otf"
  | "image/png"
  | "application/pdf"
  | "application/php"
  | "application/vnd.ms-powerpoint"
  | "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  | "application/vnd.rar"
  | "application/rtf"
  | "application/x-sh"
  | "image/svg+xml"
  | "application/x-shockwave-flash"
  | "application/x-tar"
  | "image/tiff"
  | "video/mp2t"
  | "font/ttf"
  | "text/plain"
  | "application/vnd.visio"
  | "audio/wav"
  | "audio/webm"
  | "video/webm"
  | "image/webp"
  | "font/woff"
  | "font/woff2"
  | "application/xhtml+xml"
  | "application/vnd.ms-excel"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/xml"
  | "text/xml"
  | "application/vnd.mozilla.xul+xml"
  | "application/zip"
  | "video/3gpp"
  | "video/3gpp2"
  | "application/x-7z-compressed";

export interface ParameterMetadata {
  name: string;
  type: "string" | "number" | "object" | "array";
  description?: string;
  optional?: boolean;
}

export interface FunctionConfig {
  name?: string;
  description?: string;
  version?: number;
  parameters?: ParameterMetadata[];
  optionals?: string[];
}

export interface FunctionMetadata {
  name: string;
  description: string;
  version?: number;
  parameters: ParameterMetadata[];
  optionals?: string[];
  [key: string]: any;
}

export type CallToolParams = z.infer<typeof CallToolRequestSchema>["params"];
export type CallToolMeta = NonNullable<CallToolParams["_meta"]>;
