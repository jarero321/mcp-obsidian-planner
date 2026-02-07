import { Inject, Injectable } from '@nestjs/common';
import {
  VAULT_REPOSITORY,
  VaultRepository,
  NOTE_PARSER,
  NoteParser,
} from '@application/ports';
import { Task } from '@domain/entities';
import { TaskStatus } from '@domain/enums';

export interface ListTasksInput {
  path?: string;
  folder?: string;
  status?: TaskStatus;
}

export interface ListTasksOutput {
  tasks: Task[];
  totalCount: number;
  completedCount: number;
  pendingCount: number;
}

@Injectable()
export class ListTasksUseCase {
  constructor(
    @Inject(VAULT_REPOSITORY) private readonly vault: VaultRepository,
    @Inject(NOTE_PARSER) private readonly parser: NoteParser,
  ) {}

  async execute(input: ListTasksInput): Promise<ListTasksOutput> {
    let allTasks: Task[] = [];

    if (input.path) {
      const content = await this.vault.readFile(input.path);
      allTasks = this.parser.parseTasks(content, input.path);
    } else {
      const folder = input.folder || '';
      const files = await this.vault.listFiles(folder);
      for (const file of files) {
        const content = await this.vault.readFile(file);
        const tasks = this.parser.parseTasks(content, file);
        allTasks.push(...tasks);
      }
    }

    if (input.status) {
      allTasks = allTasks.filter((t) => t.status === input.status);
    }

    const completedCount = allTasks.filter(
      (t) => t.status === TaskStatus.COMPLETED,
    ).length;

    return {
      tasks: allTasks,
      totalCount: allTasks.length,
      completedCount,
      pendingCount: allTasks.length - completedCount,
    };
  }
}
