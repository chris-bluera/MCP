#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Import servers
import { NpmDocsServer } from './npm-docs/index.js';

// Initialize servers
const server = new NpmDocsServer();

// Run server
server.run().catch(console.error);
