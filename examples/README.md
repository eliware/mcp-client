# Examples

## Requirements

Use Node.js 26 or later. Install the package dependencies with `npm ci`.
Set `MCP_URL` to a Streamable HTTP endpoint.
Set `MCP_TOKEN` when the server requires a bearer token.
Set `MCP_COMMAND` and `MCP_ARGS` for the stdio example when needed.

## Permissions

Use only servers that your account may access. Provide only the credentials that the server requires.
The examples make MCP requests. They do not change server data.

## Commands and results

| Example                              | Command                            | Expected result                           |
| ------------------------------------ | ---------------------------------- | ----------------------------------------- |
| [HTTP](http.mjs)                     | `node examples/http.mjs`           | Lists server tools.                       |
| [Custom headers](custom-headers.mjs) | `node examples/custom-headers.mjs` | Lists server tools with a custom header.  |
| [Static token](static-token.mjs)     | `node examples/static-token.mjs`   | Lists server tools with a bearer token.   |
| [stdio](stdio.mjs)                   | `node examples/stdio.mjs`          | Lists server tools from a local process.  |
| [Token provider](token-provider.mjs) | `node examples/token-provider.mjs` | Lists server tools with a token provider. |

## Cleanup

Each example closes its client. Stop any local server process that you started for an example.
