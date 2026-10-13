# Release Notes

## 12.0.0 — 2026-10-12

### Added

Added usage, API, and troubleshooting guides. Added repository specifications, shared validation, and standard CI and package publication workflows.
Added the standard Knit deployment workflow and an index for the supported examples.

### Changed

Raised the package version to 12.0.0 and the minimum Node.js version to 26. Moved source modules and declarations under `src/`.
Set explicit package exports. Updated dependencies, package metadata, examples, and release records to Eliware Convention 12.0.
Split client logic into focused modules and added matching tests with full coverage checks. Replaced local checks with shared Eliware validation.

### Fixed

Added Windows IPv4 support for HTTP and SSE connections. Improved reconnect handling and validation for numeric options.

### Breaking changes

Require Node.js 26 or later. Import the package through its public package entrypoint.

### Migration

Install the 12.0.0 package. Replace direct imports of old source paths with imports from `@eliware/mcp-client`.
