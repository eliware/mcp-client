# AGENTS.md

## Project

Use Node.js 26 or later. Use native ESM.

## Scope and boundaries

Maintain the MCP client package. Keep server access, OAuth flows, tokens, and user sessions in client applications.

## Layout

Keep source modules under `src/`. Keep tests under `tests/` and fixtures under `test-fixtures/`.
Keep examples under `examples/` and index each example.
Mirror each source module under `src/` with one same-path test under `tests/`.

## Development

Give each source module and test module one purpose.

## Validation

Run `npm test` for aggregate validation.
Run `npm run lint` for lint checks.
Run `npm run audit` for audit checks.
Run `npm run format` to format files.
Run `npm run format:check` to check formatting.
Run `npm run typecheck` to check TypeScript declarations.

## Security

Keep credentials, secrets, and private data out of Git.
Send stdio server logs to stderr.

## Changes

Keep public documents current. Follow shared conventions.

## Library

Run focused tests first during development.
Run one test file with `npm test -- tests/path/to/example.test.mjs`.
Run multiple test files with `npm test -- tests/path/to/first.test.mjs tests/path/to/second.test.mjs`.
Prevent repeated full-suite runs during development.
Run the full `npm test` suite for final validation before a commit, milestone, or release.

## npm publication

Run `npm run pack` before package checks.
Follow the approved Eliware Operations publication procedure.
