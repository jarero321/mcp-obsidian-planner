import { Module } from '@nestjs/common';
import { ConfigModule } from '@config/config.module';
import { LoggingModule } from '@infrastructure/logging/logging.module';
import { VaultModule } from '@infrastructure/vault/vault.module';
import { ParserModule } from '@infrastructure/parser/parser.module';
import { TemplateModule } from '@infrastructure/template/template.module';
import {
  CreateDailyUseCase,
  GetDailyUseCase,
  SetDailyFocusUseCase,
  ListInboxUseCase,
  AddInboxUseCase,
  ProcessInboxUseCase,
  PrioritizeInboxUseCase,
  ListTasksUseCase,
  ToggleTaskUseCase,
  AddTaskUseCase,
  WeeklySummaryUseCase,
  CreateWeeklyUseCase,
  VaultSearchUseCase,
  ReadNoteUseCase,
  ListNotesUseCase,
  ListProjectsUseCase,
  CreateProjectUseCase,
} from '@application/use-cases';
import { McpHandler } from './handlers';
import { McpPresenter } from './mcp-presenter.service';
import { McpServer } from './mcp.server';

@Module({
  imports: [
    ConfigModule,
    LoggingModule,
    VaultModule,
    ParserModule,
    TemplateModule,
  ],
  providers: [
    // Use cases - Daily
    CreateDailyUseCase,
    GetDailyUseCase,
    SetDailyFocusUseCase,
    // Use cases - Inbox
    ListInboxUseCase,
    AddInboxUseCase,
    ProcessInboxUseCase,
    PrioritizeInboxUseCase,
    // Use cases - Tasks
    ListTasksUseCase,
    ToggleTaskUseCase,
    AddTaskUseCase,
    // Use cases - Weekly
    WeeklySummaryUseCase,
    CreateWeeklyUseCase,
    // Use cases - Search
    VaultSearchUseCase,
    ReadNoteUseCase,
    ListNotesUseCase,
    // Use cases - Projects
    ListProjectsUseCase,
    CreateProjectUseCase,
    // MCP infrastructure
    McpPresenter,
    McpHandler,
    McpServer,
  ],
  exports: [McpServer],
})
export class McpModule {}
