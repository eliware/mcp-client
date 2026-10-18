# AGENTS.md

## Project

Use Node.js 26 or later. Use native ESM.

## Scope and boundaries

Maintain the MCP client package. Keep server access, OAuth flows, tokens, and user sessions in client applications.

## Layout

Keep source modules under `src/`. Keep tests under `tests/`. Keep test fixtures under `test-fixtures/`.

Keep examples under `examples/`. Add each document to its folder index.

## Development

Give each source module and test module one purpose.

Mirror each file under `src/` with one same-path test under `tests/`.

## Validation

Use Node.js 26 or later with native ESM. Use npm 12 or later for repository checks.

Run `npm test` for aggregate validation. Run `npm run lint` for lint checks.

Run `npm run audit` for audit checks. Run `npm run format` to format files.

Run `npm run format:check` to check formatting. Run `npm run pack` before package checks.

Run `npm run typecheck` to check TypeScript declarations.

## Security

Keep credentials, tokens, secrets, private data, and machine-specific values out of commits.

Do not print secrets in output. Send stdio server logs to stderr.

## Changes

Keep documents current. Follow shared conventions and Eliware Operations procedures.

## Library

Use `src/index.mjs` as the public entry point. Keep declarations in `src/index.d.ts`.

Use MCP SDK v2 with Streamable HTTP or stdio to connect to MCP servers.
Pin the current protocol version. Do not add support for older SDK or protocol versions.

Keep OAuth discovery, consent, token refresh, and user sessions in the consuming application.

Run focused tests first during development.

Run one test file with `npm test -- tests/path/to/example.test.mjs`.

Run multiple test files with `npm test -- tests/path/to/first.test.mjs tests/path/to/second.test.mjs`.

Prevent repeated full-suite runs during development.

Run the full `npm test` suite for final validation before a commit, milestone, or release.

## npm publication

Publish `@eliware/mcp-client` with the version in `package.json`.

Run `npm run pack` before you check the package for publication.

Follow the Eliware Operations publication checklist and approval process.
