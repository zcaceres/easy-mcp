import type { Root } from "@modelcontextprotocol/sdk/types.js";

class RootsManager {
  roots: Root[] = [];

  add(config: Root) {
    this.roots.push(config);
  }

  list() {
    return [];
  }

  static create() {
    return new RootsManager();
  }
}

export default RootsManager;