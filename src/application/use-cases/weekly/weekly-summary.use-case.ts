import { Inject, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { VAULT_CONFIG, VaultConfig } from '@config/vault.config';
import {
  VAULT_REPOSITORY,
  VaultRepository,
  NOTE_PARSER,
  NoteParser,
} from '@application/ports';
import { WeeklyReview } from '@domain/entities';
import { Task } from '@domain/entities/task.entity';
import { ProjectStatus } from '@domain/enums';

dayjs.extend(weekOfYear);

export interface WeeklySummaryInput {
  date?: string;
}

export interface WeeklySummaryOutput {
  review: WeeklyReview;
}

@Injectable()
export class WeeklySummaryUseCase {
  constructor(
    @Inject(VAULT_REPOSITORY) private readonly vault: VaultRepository,
    @Inject(NOTE_PARSER) private readonly parser: NoteParser,
    @Inject(VAULT_CONFIG) private readonly config: VaultConfig,
  ) {}

  async execute(input: WeeklySummaryInput): Promise<WeeklySummaryOutput> {
    const endDate = dayjs(input.date || undefined);
    const startDate = endDate.subtract(6, 'day');

    // Collect tasks from daily notes in the week range
    const completedTasks: Task[] = [];
    const pendingTasks: Task[] = [];
    let dailiesCount = 0;

    for (let d = startDate; d.isBefore(endDate) || d.isSame(endDate, 'day'); d = d.add(1, 'day')) {
      const notePath = `${this.config.dailyFolder}/${d.format('YYYY-MM-DD')}.md`;
      if (await this.vault.fileExists(notePath)) {
        dailiesCount++;
        const content = await this.vault.readFile(notePath);
        const tasks = this.parser.parseTasks(content, notePath);
        for (const task of tasks) {
          if (task.isCompleted) {
            completedTasks.push(task);
          } else {
            pendingTasks.push(task);
          }
        }
      }
    }

    // Collect project summaries
    const projectFiles = await this.vault.listFiles(this.config.projectsFolder);
    const projectsSummary: { name: string; status: string; tasksDone: number; tasksTotal: number }[] = [];

    for (const file of projectFiles) {
      const content = await this.vault.readFile(file);
      const fm = this.parser.parseFrontmatter(content);
      const status = String(fm.estado || ProjectStatus.NOT_STARTED);
      if (status === ProjectStatus.COMPLETED) continue;

      const tasks = this.parser.parseTasks(content, file);
      const done = tasks.filter((t) => t.isCompleted).length;

      projectsSummary.push({
        name: file.split('/').pop()?.replace('.md', '') || file,
        status,
        tasksDone: done,
        tasksTotal: tasks.length,
      });
    }

    const review = new WeeklyReview({
      weekNumber: endDate.week(),
      dateRange: {
        start: startDate.format('YYYY-MM-DD'),
        end: endDate.format('YYYY-MM-DD'),
      },
      completedTasks,
      pendingTasks,
      dailiesCount,
      projectsSummary,
    });

    return { review };
  }
}
