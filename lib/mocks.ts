import { faker } from "@faker-js/faker";
import type { Resource, Tool } from "@modelcontextprotocol/sdk/types.js";

export function createMockResource(): Resource {
  return {
    uri: faker.internet.url(),
    name: faker.lorem.word(),
    description: faker.lorem.sentence(),
    mimeType: faker.system.mimeType(),
  };
}

export function createMockTool(): Tool {
  return {
    name: faker.lorem.word(),
    description: faker.lorem.sentence(),
    inputSchema: {
      type: "object",
      properties: {
        [faker.lorem.word()]: {
          type: faker.helpers.arrayElement(["string", "number", "boolean"]),
        },
      },
      required: [faker.lorem.word()],
    },
  };
}
