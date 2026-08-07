# AGENTS.md

## Project

`@eliware/mcp-client` is a pure-ESM MCP client supporting Streamable HTTP, legacy SSE, stdio, authentication, token providers, lifecycle management, and reconnects.

## API and security

- Preserve MCP SDK client/transport injection and explicit `close()`, `disconnect()`, and `reconnect()` behavior.
- Keep bearer tokens, headers, token providers, reconnect limits, and AbortSignal behavior documented and typed.
- Never log tokens, credentials, private URLs, or sensitive tool arguments/results.
- Do not connect to an MCP server during module import or tests unless explicitly requested.

## Validation

Run `npm test`, `npm run test:gaps`, `npm run lint`, `npm run typecheck`, and `npm run pack`. Cover transport, reconnect, cancellation, authentication, and cleanup paths.

## Changes

Update README and declarations for public API changes. Do not bump versions, tag, publish, or push unless explicitly requested.
