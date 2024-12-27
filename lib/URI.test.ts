import { expect, test, describe } from "bun:test";
import URI from "../lib/URI";
import type { ResourceTemplateCache } from "../types";

describe("URI", () => {
  describe("createUrlMatcher", () => {
    test("should create a matcher for a file protocol URL", () => {
      const matcher = URI.createUrlMatcher("file://{param1}/{param2}");
      expect(matcher).toHaveProperty("regex");
      expect(matcher).toHaveProperty("keys");
      expect(matcher.keys).toHaveLength(2);
    });

    test("should create a matcher for a custom protocol URL", () => {
      const matcher = URI.createUrlMatcher(
        "my-custom-protocol://somepath/{param3}",
      );
      expect(matcher).toHaveProperty("regex");
      expect(matcher).toHaveProperty("keys");
      expect(matcher.keys).toHaveLength(1);
    });
  });

  describe("matchUrl", () => {
    test("should match a file protocol URL", () => {
      const matcher = URI.createUrlMatcher("file://{param1}/{param2}");
      const result = URI.matchUrl("file://desktop/user.txt", matcher);
      expect(result).toEqual({ param1: "desktop", param2: "user.txt" });
    });

    test("should match a custom protocol URL", () => {
      const matcher = URI.createUrlMatcher(
        "my-custom-protocol://somepath/{param3}",
      );
      const result = URI.matchUrl(
        "my-custom-protocol://somepath/12345",
        matcher,
      );
      expect(result).toEqual({ param3: "12345" });
    });

    test("should return null for non-matching URL", () => {
      const matcher = URI.createUrlMatcher("file://{param1}/{param2}");
      const result = URI.matchUrl("http://example.com", matcher);
      expect(result).toBeNull();
    });
  });

  describe("extractParamsFromURI", () => {
    const mockTemplate = {
      definition: {
        uriTemplate: "file://{param1}/{param2}",
      },
    };

    test("should extract parameters from a matching URI", () => {
      const result = URI.extractParamsFromURI(
        "file://desktop/user.txt",
        mockTemplate,
      );
      expect(result).toEqual({ param1: "desktop", param2: "user.txt" });
    });

    test("should return null for a non-matching URI", () => {
      const result = URI.extractParamsFromURI(
        "http://example.com",
        mockTemplate,
      );
      expect(result).toBeNull();
    });
  });

  describe("findMatchingTemplate", () => {
    const mockTemplates: ResourceTemplateCache = {
      "file://{param1}/{param2}": {
        definition: {
          uriTemplate: "file://{param1}/{param2}",
        },
      },
      "custom://{param3}": {
        definition: {
          uriTemplate: "custom://{param3}",
        },
      },
    };

    test("should return the matching template for a valid URI", () => {
      const result = URI.findMatchingTemplate(
        "file://desktop/user.txt",
        mockTemplates,
      );
      expect(result).toEqual(mockTemplates["file://{param1}/{param2}"]);
    });

    test("should return the matching template for another valid URI", () => {
      const result = URI.findMatchingTemplate("custom://12345", mockTemplates);
      expect(result).toEqual(mockTemplates["custom://{param3}"]);
    });

    test("should return undefined for a non-matching URI", () => {
      const result = URI.findMatchingTemplate(
        "http://example.com",
        mockTemplates,
      );
      expect(result).toBeUndefined();
    });
  });
});
