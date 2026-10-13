import { expect, test } from "@jest/globals";
import { createClientTransport, createTransport } from "../src/transports.mjs";

class HTTP {
  constructor(url, options) {
    this.url = url;
    this.options = options;
  }
}

class SSE extends HTTP {}

class Stdio {
  constructor(options) {
    this.options = options;
  }
}

test("creates an injected transport with a bearer token", () => {
  const transport = createTransport({ TransportClass: HTTP, url: "http://x", token: "t" });
  expect(transport.options.requestInit.headers.Authorization).toBe("Bearer t");
});

test("passes an IPv4 dispatcher to an injected transport", () => {
  const dispatcher = {};
  const transport = createTransport({
    TransportClass: HTTP,
    url: "http://x",
    dispatcher,
  });
  expect(transport.options.requestInit.dispatcher).toBe(dispatcher);
});

test("creates a client transport from client options", () => {
  const transport = createClientTransport({ TransportClass: HTTP, url: "http://x" }, "token");
  expect(transport.options.requestInit.headers.Authorization).toBe("Bearer token");
});

test("creates HTTP with an IPv4 dispatcher", () => {
  const dispatcher = {};
  const transport = createTransport({
    transport: "http",
    url: "http://x",
    dispatcher,
    HTTPTransportClass: HTTP,
  });
  expect(transport.options.requestInit.dispatcher).toBe(dispatcher);
});

test("creates HTTP and SSE transports", () => {
  expect(
    createTransport({ transport: "http", url: "http://x", HTTPTransportClass: HTTP }),
  ).toBeInstanceOf(HTTP);
  expect(
    createTransport({ transport: "sse", url: "https://x/sse", SSETransportClass: SSE }).url,
  ).toEqual(new URL("https://x/sse"));
});

test("creates a stdio transport", () => {
  const transport = createTransport({
    transport: "stdio",
    command: "node",
    args: ["x"],
    env: { A: "1" },
    StdioTransportClass: Stdio,
  });
  expect(transport.options).toEqual({ command: "node", args: ["x"], env: { A: "1" } });
});

test("constructs native SDK transports", async () => {
  const http = createTransport({ transport: "http", url: "https://x/mcp" });
  const sse = createTransport({ transport: "sse", url: "https://x/sse" });
  const stdio = createTransport({
    transport: "stdio",
    command: process.execPath,
    args: ["-e", ""],
  });
  expect(http.constructor.name).toBe("StreamableHTTPClientTransport");
  expect(sse.constructor.name).toBe("SSEClientTransport");
  expect(stdio.constructor.name).toBe("StdioClientTransport");
  await stdio.close();
});
