# AGENTS.md

## Project

Build the Eliware MCP client with Node.js 26 or later. Use native ESM.

## Scope and boundaries

This repository owns the MCP client package. Applications own server access, OAuth flows, tokens, and user sessions.
Do not use validation to publish, deploy, release, sync, or change external systems.

## Layout

Keep implementation modules under `src/`. Keep tests under `tests/` and fixtures under `test-fixtures/`.
Keep examples under `examples/`. Keep each document in its indexed folder.

## Development

Give each source and test module one clear purpose. Keep each coordinator responsible for its workflow.
Add one mirrored test for each `.mjs` module under `src/`.

## Validation

Use Node.js 26 or later and native ESM. Use npm 12 or later for repository validation.
Run `npm test` for aggregate validation. Run `npm run lint` for lint checks.
Run `npm run audit` for audit checks. Run `npm run format` to format files.
Run `npm run format:check` to check file format. Run `npm run pack` before package review.
Run `npm run typecheck` to check TypeScript declarations.

## Security

Protect credentials, tokens, secrets, private data, and machine-specific values.
Do not print secrets in logs. Keep stdio server logs on stderr.

## Changes

Keep documentation current and direct. Follow shared conventions and Eliware Operations procedures.

## Library

The public entrypoint is `src/index.mjs`. The TypeScript declarations are in `src/index.d.ts`.
Use Streamable HTTP, SSE, or stdio to connect to MCP servers.
Keep OAuth discovery, consent, token refresh, and user sessions in the consuming application.

## npm publication

The public package is `@eliware/mcp-client`. The package version is in `package.json`.
Run `npm run pack` before publication review. Follow the Eliware Operations publication checklist and approval process.
