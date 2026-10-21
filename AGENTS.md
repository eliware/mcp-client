# AGENTS.md

## Project

Maintain the Eliware MCP client package. Use Node.js 26 or later and native ESM.

## Scope and boundaries

Keep server access, OAuth flows, tokens, and user sessions in client applications.

## Layout

Use README.md and specs/README.md to find maintained files.

## Development

Give each source module and test module one purpose.

## Validation

Run `npm test` for aggregate validation.
Run `npm run lint` for lint checks.
Run `npm run audit` for dependency checks.
Run `npm run format` to format files.
Run `npm run format:check` to check formatting.
Run `npm run typecheck` to check TypeScript declarations.

## Security

Keep credentials, secrets, and private data out of Git.
Send stdio server logs to stderr.

## Changes

Keep each document in the repository that owns its content. Update its nearest index when you add a document.

## Library

Run focused tests first during development.
Run one test file with `npm test -- tests/path/to/example.test.mjs`.
Run multiple test files with `npm test -- tests/path/to/first.test.mjs tests/path/to/second.test.mjs`.
Prevent repeated full-suite runs during development.
Run the full `npm test` suite for final validation before a commit, milestone, or release.

## npm publication

Run `npm run pack` to check package contents. Publish only after approved release steps.
