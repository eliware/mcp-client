import { expect, jest, test } from "@jest/globals";
import { createClientTransport } from "../src/transports.mjs";

class HTTP {
  constructor(url, options) {
    this.url = url;
    this.options = options;
  }
}

class Stdio {
  constructor(options) {
    this.options = options;
  }
}

test("creates Streamable HTTP with the default endpoint", () => {
  const transport = createClientTransport({}, { HTTPTransportClass: HTTP });
  expect(transport.url.href).toBe("http://localhost:1234/mcp");
});

test("uses the SDK v2 Streamable HTTP transport by default", () => {
  const transport = createClientTransport({ url: "http://localhost/mcp" });
  expect(transport.constructor.name).toBe("StreamableHTTPClientTransport");
});

test("creates Streamable HTTP with bearer and custom headers", () => {
  const transport = createClientTransport(
    { url: "https://mcp.example/mcp", token: "secret", headers: { "x-app": "test" } },
    { HTTPTransportClass: HTTP },
  );
  expect(transport.url.href).toBe("https://mcp.example/mcp");
  expect(transport.options.requestInit.headers).toEqual({
    "x-app": "test",
    Authorization: "Bearer secret",
  });
});

test("uses the token provider for HTTP requests", () => {
  const tokenProvider = jest.fn(async () => "rotated");
  const transport = createClientTransport(
    {
      tokenProvider,
      headers: { "x-app": "test", Authorization: "Basic stale", authorization: "Basic old" },
    },
    { HTTPTransportClass: HTTP },
  );
  expect(transport.options.authProvider.token).toBe(tokenProvider);
  expect(transport.options.requestInit.headers).toEqual({ "x-app": "test" });
});

test("uses the environment token when options omit a token", () => {
  const previousToken = process.env.MCP_TOKEN;
  process.env.MCP_TOKEN = "environment-token";
  const transport = createClientTransport({}, { HTTPTransportClass: HTTP });
  expect(transport.options.requestInit.headers.Authorization).toBe("Bearer environment-token");
  if (previousToken === undefined) delete process.env.MCP_TOKEN;
  else process.env.MCP_TOKEN = previousToken;
});

test("uses environment values for the default URL", () => {
  const previousUrl = process.env.MCP_URL;
  const previousPort = process.env.MCP_PORT;
  delete process.env.MCP_URL;
  process.env.MCP_PORT = "4321";
  const transport = createClientTransport({}, { HTTPTransportClass: HTTP });
  expect(transport.url.href).toBe("http://localhost:4321/mcp");
  if (previousUrl === undefined) delete process.env.MCP_URL;
  else process.env.MCP_URL = previousUrl;
  if (previousPort === undefined) delete process.env.MCP_PORT;
  else process.env.MCP_PORT = previousPort;
});

test("starts stdio with process settings", () => {
  const transport = createClientTransport(
    { transport: "stdio", command: "node", args: ["server.mjs"], env: { MODE: "test" } },
    { StdioTransportClass: Stdio },
  );
  expect(transport.options).toEqual({
    command: "node",
    args: ["server.mjs"],
    env: { MODE: "test" },
  });
});

test("requires an executable for stdio", () => {
  expect(() => createClientTransport({ transport: "stdio" })).toThrow(
    "stdio transport requires command",
  );
});

test("rejects unsupported transports", () => {
  expect(() => createClientTransport({ transport: "sse" })).toThrow(
    "Unsupported MCP transport: sse",
  );
});
