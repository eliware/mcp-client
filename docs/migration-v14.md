# Migrate to version 14

Version 14 keeps the current client API. Use this guide when you upgrade from version 12 or earlier.

## Install version 14

Install version 14:

```bash
npm install @eliware/mcp-client@14
```

Use Node.js 26 or later. Use a server that supports protocol version `2026-07-28`.

## Update imports

Import `mcpClient` by name:

```js
import { mcpClient } from "@eliware/mcp-client";
```

## Update connection options

Use Streamable HTTP or stdio. Set `url` for HTTP connections.
Set `transport` to `"stdio"` and set `command` for a local server process.
Remove `transport: "sse"` and reconnect options.

## Update cleanup

Call `await client.close()` when the application no longer needs the connection.
Remove calls to `disconnect()`, `reconnect()`, and `mcpConnection`.

## Keep authentication in the application

Pass a bearer value with `token` or return it from `tokenProvider`.
Keep OAuth discovery, consent, refresh, and session state in the consuming application.
