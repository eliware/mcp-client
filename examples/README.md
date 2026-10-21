# Examples

Use these examples with an MCP server that you may access. The HTTP examples need a reachable Streamable HTTP endpoint. The stdio example needs a local MCP server command.

## Requirements

- Use Node.js 26 or later.
- Use a reachable Streamable HTTP endpoint for each HTTP example.
- Install or build a local MCP server that supports stdio before you run the stdio example.

## Environment values

Set these values in the process environment before you run an example.

| Variable      | Default                     | Required status                | Example value                         |
| ------------- | --------------------------- | ------------------------------ | ------------------------------------- |
| `MCP_URL`     | `http://localhost:1234/mcp` | Optional                       | `https://your-mcp-server.example/mcp` |
| `MCP_PORT`    | `1234`                      | Optional                       | `4321`                                |
| `MCP_TOKEN`   | None                        | Optional                       | `your-mcp-token-here`                 |
| `MCP_COMMAND` | None                        | Required for the stdio example | `node`                                |
| `MCP_ARGS`    | None                        | Required for the stdio example | `["/path/to/server.mjs","--stdio"]`   |

The package does not load `.env` files. Set each value in the process environment before you run an example.

## Run from a repository checkout

Run checkout commands from the repository root. The checkout contains `package-lock.json`, so `npm ci` installs the locked dependencies.

```bash
git clone https://github.com/eliware/mcp-client.git
cd mcp-client
npm ci
```

Set an HTTP endpoint and run an HTTP example:

```powershell
$env:MCP_URL = 'https://your-mcp-server.example/mcp'
node examples/http.mjs
```

```sh
export MCP_URL='https://your-mcp-server.example/mcp'
node examples/http.mjs
```

Set `MCP_TOKEN` before you run an example that needs bearer authentication. Set `MCP_URL` to the endpoint that your server provides.

## Run from an installed package

Run these commands from a consumer application directory. `npm install` installs the published package and creates the consumer application's lockfile.

```bash
npm init -y
npm install @eliware/mcp-client
```

Set `MCP_URL` in the same shell, then run an example from the installed package with `npm explore`:

```powershell
$env:MCP_URL = 'https://your-mcp-server.example/mcp'
npm explore @eliware/mcp-client -- node examples/http.mjs
```

```sh
export MCP_URL='https://your-mcp-server.example/mcp'
npm explore @eliware/mcp-client -- node examples/http.mjs
```

Run `npm explore @eliware/mcp-client -- node examples/<name>.mjs` to run another packaged example. Do not run `npm ci` in an installed package because the package does not include `package-lock.json`.

## Run the stdio example

Set `MCP_COMMAND` to the executable for your local server. Set `MCP_ARGS` to a JSON array of strings. Use `[]` when the command needs no arguments. Replace the sample path with the server path on your computer.

```powershell
$env:MCP_COMMAND = 'node'
$env:MCP_ARGS = '["C:\\path\\to\\server.mjs","--stdio"]'
node examples/stdio.mjs
```

```sh
export MCP_COMMAND='node'
export MCP_ARGS='["/path/to/server.mjs","--stdio"]'
node examples/stdio.mjs
```

The JSON array in `MCP_ARGS` becomes the argument list for `MCP_COMMAND`. The example stops with an error if either variable is missing or if `MCP_ARGS` is not a JSON array of strings.

## Commands and results

Run checkout commands from the repository root. Run installed-package commands from the consumer application directory.

| Example                              | Checkout command                   | Installed-package command                                             | Expected result                                |
| ------------------------------------ | ---------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------- |
| [HTTP](http.mjs)                     | `node examples/http.mjs`           | `npm explore @eliware/mcp-client -- node examples/http.mjs`           | Lists tools from the configured HTTP server.   |
| [Custom headers](custom-headers.mjs) | `node examples/custom-headers.mjs` | `npm explore @eliware/mcp-client -- node examples/custom-headers.mjs` | Lists tools with the configured custom header. |
| [Static token](static-token.mjs)     | `node examples/static-token.mjs`   | `npm explore @eliware/mcp-client -- node examples/static-token.mjs`   | Lists tools with the configured bearer token.  |
| [stdio](stdio.mjs)                   | `node examples/stdio.mjs`          | `npm explore @eliware/mcp-client -- node examples/stdio.mjs`          | Lists tools from the configured local server.  |
| [Token provider](token-provider.mjs) | `node examples/token-provider.mjs` | `npm explore @eliware/mcp-client -- node examples/token-provider.mjs` | Lists tools with a token from `MCP_TOKEN`.     |

## Permissions

Use only servers that your account may access. Provide only the credentials that the server requires. The examples make MCP requests and do not change server data.

## Cleanup

Each example closes its client after it lists tools. The stdio example also closes its client if the request fails. Stop any server process that you started separately.
