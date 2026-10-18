# Migrate to version 13

Version 13 uses MCP SDK v2. It requires protocol version `2026-07-28` with Streamable HTTP or stdio.
Version 13 removes the default export, SSE transport, reconnect wrapper, and compatibility methods.

## Update the package

Install version 13:

```bash
npm install @eliware/mcp-client@13
```

Use an MCP server that advertises `2026-07-28` through `server/discover`.

The client rejects older protocol versions. It does not use the 2025 handshake.

## Update imports

Replace the default import with the named import:

```js
import { mcpClient } from "@eliware/mcp-client";
```

## Update connection options

Keep `transport` unset for Streamable HTTP. Set `url` to the server endpoint.

Set `transport` to `"stdio"` and set `command` for a local server process.

Remove `transport: "sse"`. Use a Streamable HTTP endpoint for that server.

Remove reconnect settings. The package no longer adds reconnect methods to the SDK client.

## Update cleanup

Call `await client.close()` when the application no longer needs the connection.
Remove calls to `disconnect()`, `reconnect()`, and `mcpConnection`.

## Keep authentication in the application

Pass a bearer value with `token` or return it from `tokenProvider`.
Keep OAuth discovery, consent, refresh, and session state in the consuming application.
