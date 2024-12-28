import { test, expect, describe } from "bun:test";
import { parseFunctionSignature, CouldNotParseError } from "./InputGenerator";
import ts from "typescript";

describe("parseFunctionSignature", () => {
  function createNode(code: string): ts.Node {
    const sourceFile = ts.createSourceFile(
      "test.ts",
      code,
      ts.ScriptTarget.Latest,
      true,
    );
    return sourceFile.statements[0];
  }

  test("should parse a simple function declaration", () => {
    const node = createNode("function simpleFunc() {}");
    const result = parseFunctionSignature(node);
    expect(result).toEqual({
      name: "simpleFunc",
      description: "",
      parameters: [],
    });
  });

  test("should parse a function with one parameter", () => {
    const node = createNode("function oneParam(x: number) {}");
    const result = parseFunctionSignature(node);
    expect(result).toEqual({
      name: "oneParam",
      description: "",
      parameters: [
        { name: "x", type: "number", description: "", required: true },
      ],
    });
  });

  test("should parse a function with multiple parameters", () => {
    const node = createNode(
      "function multiParams(x: number, y: string, z: boolean) {}",
    );
    const result = parseFunctionSignature(node);
    expect(result).toEqual({
      name: "multiParams",
      description: "",
      parameters: [
        { name: "x", type: "number", description: "", required: true },
        { name: "y", type: "string", description: "", required: true },
        { name: "z", type: "string", description: "", required: true }, // boolean is mapped to string
      ],
    });
  });

  test("should parse an arrow function", () => {
    const node = createNode("const arrowFunc = (x: number, y: string) => {}");
    const result = parseFunctionSignature(node);
    expect(result).toEqual({
      name: "arrowFunc",
      description: "",
      parameters: [
        { name: "x", type: "number", description: "", required: true },
        { name: "y", type: "string", description: "", required: true },
      ],
    });
  });

  test("should throw CouldNotParseError for non-function nodes", () => {
    const node = createNode("const x = 5;");
    expect(() => parseFunctionSignature(node)).toThrow(CouldNotParseError);
  });

  test("should parse a function with complex types", () => {
    const node = createNode(
      "function complexTypes(a: Array<string>, b: { x: number, y: string }, c: number) {}",
    );
    const result = parseFunctionSignature(node);
    expect(result).toEqual({
      name: "complexTypes",
      description: "",
      parameters: [
        { name: "a", type: "array", description: "", required: true },
        { name: "b", type: "object", description: "", required: true },
        { name: "c", type: "number", description: "", required: true },
      ],
    });
  });

  test("should parse a function with optional parameters", () => {
    const node = createNode(
      "function optionalParams(x: number, y?: string) {}",
    );
    const result = parseFunctionSignature(node);
    expect(result).toEqual({
      name: "optionalParams",
      description: "",
      parameters: [
        { name: "x", type: "number", description: "", required: true },
        { name: "y", type: "string", description: "", required: false },
      ],
    });
  });

  test("should parse a function with default parameters", () => {
    const node = createNode(
      "function defaultParams(x: number = 0, y: string = 'default') {}",
    );
    const result = parseFunctionSignature(node);
    expect(result).toEqual({
      name: "defaultParams",
      description: "",
      parameters: [
        { name: "x", type: "number", description: "", required: false },
        { name: "y", type: "string", description: "", required: false },
      ],
    });
  });

  test("should parse JSDoc comments for function parameters", () => {
    const node = createNode(`
      /**
       * @param x The first number
       * @param y The second string
       */
      function withJSDoc(x: number, y: string) {}
    `);
    const result = parseFunctionSignature(node);
    expect(result).toEqual({
      name: "withJSDoc",
      description: "",
      parameters: [
        {
          name: "x",
          type: "number",
          description: "The first number",
          required: true,
        },
        {
          name: "y",
          type: "string",
          description: "The second string",
          required: true,
        },
      ],
    });
  });

  test("should parse JSDoc comments for arrow function parameters", () => {
    const node = createNode(`
      /**
       * @param a An array of strings
       * @param b An object with properties
       */
      const arrowWithJSDoc = (a: string[], b: { prop: number }) => {}
    `);
    const result = parseFunctionSignature(node);
    expect(result).toEqual({
      name: "arrowWithJSDoc",
      description: "",
      parameters: [
        {
          name: "a",
          type: "array",
          description: "An array of strings",
          required: true,
        },
        {
          name: "b",
          type: "object",
          description: "An object with properties",
          required: true,
        },
      ],
    });
  });

  test("should handle functions with partial JSDoc comments", () => {
    const node = createNode(`
      /**
       * @param x The first number
       */
      function partialJSDoc(x: number, y: string) {}
    `);
    const result = parseFunctionSignature(node);
    expect(result).toEqual({
      name: "partialJSDoc",
      description: "",
      parameters: [
        {
          name: "x",
          type: "number",
          description: "The first number",
          required: true,
        },
        { name: "y", type: "string", description: "", required: true },
      ],
    });
  });

  test("should parse function description and parameter comments", () => {
    const node = createNode(`
      /**
       * This function adds two numbers.
       * @param x The first number
       * @param y The second number
       */
      function add(x: number, y: number) {}
    `);
    const result = parseFunctionSignature(node);
    expect(result).toEqual({
      name: "add",
      description: "This function adds two numbers.",
      parameters: [
        {
          name: "x",
          type: "number",
          description: "The first number",
          required: true,
        },
        {
          name: "y",
          type: "number",
          description: "The second number",
          required: true,
        },
      ],
    });
  });

  test("should parse function description for arrow functions", () => {
    const node = createNode(`
      /**
       * This arrow function multiplies two numbers.
       * @param a The first factor
       * @param b The second factor
       */
      const multiply = (a: number, b: number) => {}
    `);
    const result = parseFunctionSignature(node);
    expect(result).toEqual({
      name: "multiply",
      description: "This arrow function multiplies two numbers.",
      parameters: [
        {
          name: "a",
          type: "number",
          description: "The first factor",
          required: true,
        },
        {
          name: "b",
          type: "number",
          description: "The second factor",
          required: true,
        },
      ],
    });
  });

  test("should handle functions with no JSDoc comment", () => {
    const node = createNode(`function noJSDoc(x: number, y: string) {}`);
    const result = parseFunctionSignature(node);
    expect(result).toEqual({
      name: "noJSDoc",
      description: "",
      parameters: [
        { name: "x", type: "number", description: "", required: true },
        { name: "y", type: "string", description: "", required: true },
      ],
    });
  });
});
