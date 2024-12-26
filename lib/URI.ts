import { match } from "path-to-regexp";

export default class URI {
  static generateParamParserFromURI(uri: string) {
    try {
      return match(this.removeProtocol(uri));
    } catch (e) {
      throw e;
    }
  }

  private static removeProtocol(uriWithProtocol: string) {
    const protocol = uriWithProtocol.split("://")[0];
    return uriWithProtocol.replace(`${protocol}://`, "");
  }

  static parseParamsFromURI(uri: string, matcher: ReturnType<typeof match>) {
    // @ts-expect-error Seems matcher does infer correctly because params do exist!
    const { params, _path } = matcher(this.removeProtocol(uri));
    return params as Record<string, string>;
  }
}
