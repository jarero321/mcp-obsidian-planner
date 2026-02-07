import { Injectable, OnModuleInit } from '@nestjs/common';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { McpHandler } from './handlers';
import { TOOL_DEFINITIONS } from './tool-definitions';
import { zodToJsonSchema } from './zod-to-json-schema';

@Injectable()
export class McpServer implements OnModuleInit {
  private server: Server;

  constructor(private readonly handler: McpHandler) {
    this.server = new Server(
      {
        name: 'mcp-obsidian-planner',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );
  }

  onModuleInit() {
    this.registerTools();
  }

  private registerTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOL_DEFINITIONS.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: zodToJsonSchema(tool.inputSchema),
      })),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      return this.handler.handle(name, (args as Record<string, unknown>) || {});
    });
  }

  async serveStdio(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }

  async serveSSE(port: number): Promise<void> {
    const transports = new Map<string, SSEServerTransport>();

    const httpServer = createServer(
      async (req: IncomingMessage, res: ServerResponse) => {
        const url = new URL(req.url || '', `http://localhost:${port}`);

        if (url.pathname === '/sse') {
          const transport = new SSEServerTransport('/messages', res);
          const sessionId = Math.random().toString(36).substring(7);
          transports.set(sessionId, transport);

          res.on('close', () => {
            transports.delete(sessionId);
          });

          await this.server.connect(transport);
        } else if (url.pathname === '/messages' && req.method === 'POST') {
          const sessionId = url.searchParams.get('sessionId');
          const transport = sessionId ? transports.get(sessionId) : undefined;

          if (transport) {
            let body = '';
            req.on('data', (chunk: string) => (body += chunk));
            req.on('end', async () => {
              await transport.handlePostMessage(req, res, body);
            });
          } else {
            res.writeHead(404);
            res.end('Session not found');
          }
        } else {
          res.writeHead(404);
          res.end('Not found');
        }
      },
    );

    httpServer.listen(port, () => {
      process.stderr.write(`SSE Server running on http://localhost:${port}/sse\n`);
    });
  }
}
