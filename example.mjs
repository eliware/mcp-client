// Example usage for ES Modules
import mcpClient from '@eliware/mcp-client';

(async () => {
    try {
        const client = await mcpClient({
            // Optionally provide a token, or set MCP_TOKEN in env
            // token: 'your-mcp-token',
            // Optionally override baseUrl, port, log, etc.
        });
        console.log('MCP Client connected:', !!client);
        // Use the client as needed...
    } catch (err) {
        console.error('Failed to connect MCP Client:', err);
    }
})();
