#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SessionOrchestrator } from './orchestrator/session-orchestrator.js';
import { registerTools } from './server/tools.js';
import { registerResources } from './server/resources.js';
import { registerPrompts } from './server/prompts.js';

const server = new McpServer({
  name: 'the-weaver',
  version: '0.1.0',
});

const orchestrator = new SessionOrchestrator();

registerTools(server, orchestrator);
registerResources(server, orchestrator);
registerPrompts(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('The Weaver MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
