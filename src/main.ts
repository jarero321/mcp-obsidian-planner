import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { McpModule } from '@infrastructure/mcp/mcp.module';
import { McpServer } from '@infrastructure/mcp/mcp.server';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(McpModule, {
    logger: false,
  });

  const mcpServer = app.get(McpServer);

  const mode = process.argv.includes('--sse') ? 'sse' : 'stdio';
  const port = parseInt(process.env.PORT || '3000', 10);

  if (mode === 'stdio') {
    await mcpServer.serveStdio();
  } else {
    await mcpServer.serveSSE(port);
  }
}

bootstrap();
