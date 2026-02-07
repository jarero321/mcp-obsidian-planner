import { Inject, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { VAULT_CONFIG, VaultConfig } from '@config/vault.config';
import {
  VAULT_REPOSITORY,
  VaultRepository,
  NOTE_PARSER,
  NoteParser,
} from '@application/ports';
import { DailyNote } from '@domain/entities';

export interface GetDailyInput {
  date?: string;
}

export interface GetDailyOutput {
  dailyNote: DailyNote | null;
  path: string;
}

@Injectable()
export class GetDailyUseCase {
  constructor(
    @Inject(VAULT_REPOSITORY) private readonly vault: VaultRepository,
    @Inject(NOTE_PARSER) private readonly parser: NoteParser,
    @Inject(VAULT_CONFIG) private readonly config: VaultConfig,
  ) {}

  async execute(input: GetDailyInput): Promise<GetDailyOutput> {
    const date = input.date || dayjs().format('YYYY-MM-DD');
    const notePath = `${this.config.dailyFolder}/${date}.md`;

    if (!(await this.vault.fileExists(notePath))) {
      return { dailyNote: null, path: notePath };
    }

    const content = await this.vault.readFile(notePath);
    const note = this.parser.parse(content, notePath);
    const tasks = this.parser.parseTasks(content, notePath);
    const focus = this.parser.extractFocusItems(content);

    const d = dayjs(date);
    const dailyNote = new DailyNote({
      date,
      dayOfWeek: d.format('dddd'),
      focus,
      tasks,
      log: note.getSection('Log / Diario') || '',
      gratitude: this.extractNumberedItems(note.getSection('Gratitud') || ''),
      reflection: note.getSection('Reflexion Nocturna') || '',
    });

    return { dailyNote, path: notePath };
  }

  private extractNumberedItems(section: string): string[] {
    const items: string[] = [];
    for (const line of section.split('\n')) {
      const match = line.match(/^\d+\.\s*(.+)$/);
      if (match && match[1].trim()) {
        items.push(match[1].trim());
      }
    }
    return items;
  }
}
