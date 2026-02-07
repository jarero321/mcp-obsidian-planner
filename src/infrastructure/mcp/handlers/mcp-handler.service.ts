import { Injectable } from '@nestjs/common';
import type { CallToolResult, TextContent } from '@modelcontextprotocol/sdk/types.js';
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
import { McpPresenter } from '../mcp-presenter.service';

@Injectable()
export class McpHandler {
  constructor(
    private readonly createDaily: CreateDailyUseCase,
    private readonly getDaily: GetDailyUseCase,
    private readonly setDailyFocus: SetDailyFocusUseCase,
    private readonly listInbox: ListInboxUseCase,
    private readonly addInbox: AddInboxUseCase,
    private readonly processInbox: ProcessInboxUseCase,
    private readonly prioritizeInbox: PrioritizeInboxUseCase,
    private readonly listTasks: ListTasksUseCase,
    private readonly toggleTask: ToggleTaskUseCase,
    private readonly addTask: AddTaskUseCase,
    private readonly weeklySummary: WeeklySummaryUseCase,
    private readonly createWeekly: CreateWeeklyUseCase,
    private readonly vaultSearch: VaultSearchUseCase,
    private readonly readNote: ReadNoteUseCase,
    private readonly listNotes: ListNotesUseCase,
    private readonly listProjects: ListProjectsUseCase,
    private readonly createProject: CreateProjectUseCase,
    private readonly presenter: McpPresenter,
  ) {}

  async handle(name: string, args: Record<string, unknown>): Promise<CallToolResult> {
    try {
      const text = await this.dispatch(name, args);
      return this.textResult(text);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return this.errorResult(message);
    }
  }

  private async dispatch(name: string, args: Record<string, unknown>): Promise<string> {
    switch (name) {
      // Daily
      case 'daily_create': {
        const result = await this.createDaily.execute({
          date: args.date as string | undefined,
        });
        return this.presenter.formatDailyCreated(result.path, result.created);
      }
      case 'daily_get': {
        const result = await this.getDaily.execute({
          date: args.date as string | undefined,
        });
        if (!result.dailyNote) return `Daily note not found: ${result.path}`;
        return this.presenter.formatDailyNote(result.dailyNote, result.path, false);
      }
      case 'daily_set_focus': {
        const result = await this.setDailyFocus.execute({
          date: args.date as string | undefined,
          focus: args.focus as string[],
        });
        return this.presenter.formatFocusSet(result.path, result.focus);
      }

      // Inbox
      case 'inbox_list': {
        const result = await this.listInbox.execute();
        return this.presenter.formatInboxItems(result.items, result.grouped, result.totalCount);
      }
      case 'inbox_add': {
        const result = await this.addInbox.execute({
          text: args.text as string,
          isTask: args.isTask as boolean | undefined,
          priority: args.priority as any,
        });
        return this.presenter.formatInboxAdded(result.text, result.priority, result.timestamp);
      }
      case 'inbox_process': {
        const result = await this.processInbox.execute({
          lineNumber: args.lineNumber as number,
          destination: args.destination as any,
          targetPath: args.targetPath as string | undefined,
        });
        return this.presenter.formatInboxProcessed(result.action, result.itemText);
      }
      case 'inbox_prioritize': {
        const result = await this.prioritizeInbox.execute({
          lineNumber: args.lineNumber as number,
          newPriority: args.newPriority as any,
        });
        return this.presenter.formatInboxPrioritized(result.itemText, result.newPriority);
      }

      // Tasks
      case 'tasks_list': {
        const result = await this.listTasks.execute({
          path: args.path as string | undefined,
          folder: args.folder as string | undefined,
          status: args.status as any,
        });
        return this.presenter.formatTasks(
          result.tasks,
          result.totalCount,
          result.completedCount,
          result.pendingCount,
        );
      }
      case 'task_toggle': {
        const result = await this.toggleTask.execute({
          sourcePath: args.sourcePath as string,
          lineNumber: args.lineNumber as number,
        });
        return this.presenter.formatTaskToggled(result.text, result.newStatus);
      }
      case 'task_add': {
        const result = await this.addTask.execute({
          path: args.path as string,
          text: args.text as string,
          section: args.section as string | undefined,
        });
        return this.presenter.formatTaskAdded(result.path, result.text);
      }

      // Weekly
      case 'weekly_summary': {
        const result = await this.weeklySummary.execute({
          date: args.date as string | undefined,
        });
        return this.presenter.formatWeeklySummary(result.review);
      }
      case 'weekly_create': {
        const result = await this.createWeekly.execute({
          date: args.date as string | undefined,
        });
        return this.presenter.formatWeeklyCreated(result.path, result.created);
      }

      // Search
      case 'vault_search': {
        const result = await this.vaultSearch.execute({
          query: args.query as string,
          folder: args.folder as string | undefined,
          limit: args.limit as number | undefined,
        });
        return this.presenter.formatSearchResults(
          result.results,
          result.totalCount,
          result.query,
        );
      }
      case 'note_read': {
        const result = await this.readNote.execute({
          path: args.path as string,
        });
        return this.presenter.formatNote(result.note);
      }
      case 'notes_list': {
        const result = await this.listNotes.execute({
          folder: args.folder as string,
          pattern: args.pattern as string | undefined,
        });
        return this.presenter.formatNotesList(result.files, result.totalCount);
      }

      // Projects
      case 'projects_list': {
        const result = await this.listProjects.execute({
          status: args.status as any,
          area: args.area as string | undefined,
        });
        return this.presenter.formatProjects(result.projects, result.totalCount);
      }
      case 'project_create': {
        const result = await this.createProject.execute({
          name: args.name as string,
          area: args.area as string,
        });
        return this.presenter.formatProjectCreated(
          result.name,
          result.area,
          result.path,
          result.created,
        );
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private textResult(text: string): CallToolResult {
    const content: TextContent = { type: 'text', text };
    return { content: [content] };
  }

  private errorResult(message: string): CallToolResult {
    const content: TextContent = { type: 'text', text: `Error: ${message}` };
    return { content: [content], isError: true };
  }
}
