import ts, { type NodeArray } from "typescript";
import type { ToolArg } from "../types";

export class CouldNotParseError extends Error {
  message = "Could not parse function declaration";
}

export function parseFunctionSignature(node: ts.Node) {
  let name: string | undefined;
  let parameters: NodeArray<ts.ParameterDeclaration> | undefined;
  let jsDocComment: ts.JSDoc | undefined;

  if (ts.isFunctionDeclaration(node)) {
    name = node.name?.getText();
    parameters = node.parameters;
    jsDocComment = node.jsDoc?.[0];
  } else if (ts.isVariableStatement(node)) {
    const declaration = node.declarationList.declarations[0];
    if (
      declaration &&
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer &&
      ts.isArrowFunction(declaration.initializer)
    ) {
      name = declaration.name.getText();
      parameters = declaration.initializer.parameters;
      jsDocComment = (node as ts.VariableStatement).jsDoc?.[0];
    }
  }

  if (!parameters) throw new CouldNotParseError();

  const { functionDescription, paramDescriptions } =
    extractJSDocInfo(jsDocComment);

  return {
    name,
    description: functionDescription,
    parameters: parameters.map((param): ToolArg => {
      const paramType = param.type ? param.type.getText() : "any";
      const paramName = param.name.getText();
      return {
        name: paramName,
        type: mapTypeToToolArgType(paramType),
        description: paramDescriptions[paramName] || "",
        required: !param.questionToken && !param.initializer,
      };
    }),
  };
}

function extractJSDocInfo(jsDoc: ts.JSDoc | undefined): {
  functionDescription: string;
  paramDescriptions: Record<string, string>;
} {
  const paramDescriptions: Record<string, string> = {};
  let functionDescription = "";

  if (jsDoc) {
    // Extract function description
    if (jsDoc.comment) {
      functionDescription =
        typeof jsDoc.comment === "string"
          ? jsDoc.comment
          : jsDoc.comment.map((c) => c.text).join(" ");
    }

    // Extract parameter descriptions
    jsDoc.tags?.forEach((tag) => {
      if (ts.isJSDocParameterTag(tag) && tag.name && tag.comment) {
        paramDescriptions[tag.name.getText()] =
          typeof tag.comment === "string"
            ? tag.comment
            : tag.comment.map((c) => c.text).join(" ");
      }
    });
  }

  return { functionDescription, paramDescriptions };
}

function mapTypeToToolArgType(type: string): ToolArg["type"] {
  // Complex types must be checked first for cases where primitive types are wrapped in other type identifiers such as: Array<string>
  if (type.includes("Array") || type.includes("[]")) return "array";
  if (type.includes("{") || type.includes("object")) return "object";
  if (type.includes("string")) return "string";
  if (type.includes("number")) return "number";
  return "string"; // Default to string for unknown types
}
