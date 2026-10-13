# AGENTS.md

## Project

Use Node.js 26 or later. Use native ESM.

## Scope and boundaries

Maintain the MCP client package. Keep server access, OAuth flows, tokens, and user sessions in client applications.

## Layout

Keep source modules under `src/`. Keep tests under `tests/`. Keep test fixtures under `test-fixtures/`.
Keep examples under `examples/`. Index each document in its folder.

## Development

Give each source and test module one purpose. Mirror each `src/*.mjs` file with one test file under `tests/`.

## Validation

Use Node.js 26 or later and native ESM. Use npm 12 or later for repository validation.
Run `npm test` for aggregate validation. Run `npm run lint` for lint checks.
Run `npm run audit` for audit checks. Run `npm run format` to format files.
Run `npm run format:check` to check file format. Run `npm run pack` before package review.
Run `npm run typecheck` to check TypeScript declarations.

## Security

Protect credentials, tokens, secrets, private data, and machine-specific values.
Do not print secrets in logs. Send stdio server logs to stderr.

## Changes

Keep documentation current. Follow shared conventions and Eliware Operations procedures.

## Library

Use `src/index.mjs` as the public entrypoint. Keep declarations in `src/index.d.ts`.
Use Streamable HTTP, SSE, or stdio to connect to MCP servers.
Keep OAuth discovery, consent, token refresh, and user sessions in the consuming application.

## npm publication

Publish `@eliware/mcp-client` with the version in `package.json`.
Run `npm run pack` before publication review. Follow the Eliware Operations publication checklist and approval process.
