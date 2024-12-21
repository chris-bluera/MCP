#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

interface NpmPackageInfo {
  name: string;
  description?: string;
  version: string;
  homepage?: string;
  repository?: {
    type: string;
    url: string;
  };
  bugs?: {
    url: string;
  };
  license?: string;
  author?: string | {
    name: string;
    email?: string;
    url?: string;
  };
  keywords?: string[];
}

export class NpmDocsServer {
  private server: Server;
  private axiosInstance;

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-npm-docs',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.axiosInstance = axios.create({
      baseURL: 'https://registry.npmjs.org',
    });

    this.setupToolHandlers();

    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_package_docs',
          description: 'Get documentation for an npm package',
          inputSchema: {
            type: 'object',
            properties: {
              package: {
                type: 'string',
                description: 'Package name',
              },
            },
            required: ['package'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'get_package_docs') {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      if (!request.params.arguments) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Arguments are required'
        );
      }

      const packageName = request.params.arguments.package;
      if (typeof packageName !== 'string') {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Package name must be a string'
        );
      }

      try {
        const response = await this.axiosInstance.get<any>(
          `/${encodeURIComponent(packageName)}`
        );

        const data = {
          ...response.data,
          version: response.data['dist-tags']?.latest || 'unknown'
        };
        let docsUrl = data.homepage;

        // If no homepage, try to construct docs URL from repository
        if (!docsUrl && data.repository?.url) {
          const repoUrl = data.repository.url
            .replace('git+', '')
            .replace('.git', '')
            .replace('git:', 'https:');
          docsUrl = repoUrl;
        }

        const formattedDocs = [
          `# ${data.name}@${data.version}`,
          '',
          data.description ? `${data.description}\n` : '',
          '## Quick Links',
          docsUrl ? `- Documentation: ${docsUrl}` : '',
          data.bugs?.url ? `- Issues: ${data.bugs.url}` : '',
          data.repository?.url ? `- Repository: ${data.repository.url.replace('git+', '').replace('git:', 'https:')}` : '',
          '',
          '## Package Details',
          `- License: ${data.license || 'Not specified'}`,
          typeof data.author === 'string'
            ? `- Author: ${data.author}`
            : data.author
            ? `- Author: ${data.author.name}${data.author.email ? ` <${data.author.email}>` : ''}${data.author.url ? ` (${data.author.url})` : ''}`
            : '- Author: Not specified',
          data.keywords?.length
            ? `\n## Keywords\n${data.keywords.map((k: string) => `- ${k}`).join('\n')}`
            : '',
        ].filter(Boolean).join('\n');

        return {
          content: [
            {
              type: 'text',
              text: formattedDocs,
            },
          ],
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            return {
              content: [
                {
                  type: 'text',
                  text: `Package "${packageName}" not found on npm registry`,
                },
              ],
              isError: true,
            };
          }
          return {
            content: [
              {
                type: 'text',
                text: `npm registry error: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
        throw error;
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('npm docs MCP server running on stdio');
  }
}
