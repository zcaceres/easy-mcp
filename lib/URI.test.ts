import { test, expect, describe } from "bun:test";
import URI from "./URI";

describe("URI", () => {
  describe("matchUri", () => {
    test("should create a matcher for a simple URI", () => {
      const matcher = URI.generateParamParserFromURI("/users/:id");
      expect(typeof matcher).toBe("function");
    });

    test("should throw an error for invalid URI patterns", () => {
      expect(() => URI.generateParamParserFromURI("invalid[pattern")).toThrow();
    });

    test("should create a matcher for a complex URI", () => {
      const matcher = URI.generateParamParserFromURI(
        "file://users/:id/posts/:postId",
      );
      expect(typeof matcher).toBe("function");
    });
  });

  describe("parseParams", () => {
    test("should parse parameters from a file protocol URI", () => {
      const matcher = URI.generateParamParserFromURI(
        "file://:folder/:filename",
      );
      const result = URI.parseParamsFromURI(
        "file://documents/report.pdf",
        matcher,
      );
      expect(result).toEqual({
        folder: "documents",
        filename: "report.pdf",
      });
    });

    test("should parse parameters from a custom protocol URI", () => {
      const matcher = URI.generateParamParserFromURI(
        "my-custom-protocol://resource/:resourceName",
      );
      const result = URI.parseParamsFromURI(
        "my-custom-protocol://resource/user-data",
        matcher,
      );
      expect(result).toEqual({
        resourceName: "user-data",
      });
    });

    test("should parse multiple parameters from a complex URI", () => {
      const matcher = URI.generateParamParserFromURI(
        "api://:version/users/:userId/posts/:postId",
      );
      const result = URI.parseParamsFromURI(
        "api://v1/users/123/posts/456",
        matcher,
      );
      expect(result).toEqual({
        version: "v1",
        userId: "123",
        postId: "456",
      });
    });

    test("should handle URIs with special characters", () => {
      const matcher = URI.generateParamParserFromURI("file://:path/:file.:ext");
      const result = URI.parseParamsFromURI(
        "file://my-folder/my-file.txt",
        matcher,
      );
      expect(result).toEqual({
        path: "my-folder",
        file: "my-file",
        ext: "txt",
      });
    });
  });

  describe("error handling", () => {
    test("should propagate errors from matchUri", () => {
      expect(() => URI.generateParamParserFromURI("invalid[pattern")).toThrow();
    });

    test("should not throw errors for valid but non-matching URIs", () => {
      const matcher = URI.generateParamParserFromURI("protocol://:param");
      expect(() =>
        URI.parseParamsFromURI("different://value", matcher),
      ).not.toThrow();
    });
  });
});
