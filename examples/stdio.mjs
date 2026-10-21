import { mcpClient } from "@eliware/mcp-client";

const command = process.env.MCP_COMMAND;
const argsValue = process.env.MCP_ARGS;

if (!command) throw new Error("Set MCP_COMMAND to the local MCP server executable.");
if (!argsValue) throw new Error("Set MCP_ARGS to a JSON array of server arguments.");

let args;
try {
  args = JSON.parse(argsValue);
} catch {
  throw new Error("MCP_ARGS must be valid JSON.");
}

if (!Array.isArray(args) || !args.every((value) => typeof value === "string")) {
  throw new Error("MCP_ARGS must be a JSON array of strings.");
}

const client = await mcpClient({
  transport: "stdio",
  command,
  args,
});

try {
  console.log(await client.listTools());
} finally {
  await client.close();
}
