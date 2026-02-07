import { Inject, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { VAULT_CONFIG, VaultConfig } from '@config/vault.config';
import {
  VAULT_REPOSITORY,
  VaultRepository,
  LOGGER_PORT,
  LoggerPort,
} from '@application/ports';

export interface SetDailyFocusInput {
  date?: string;
  focus: string[];
}

export interface SetDailyFocusOutput {
  path: string;
  focus: string[];
}

@Injectable()
export class SetDailyFocusUseCase {
  constructor(
    @Inject(VAULT_REPOSITORY) private readonly vault: VaultRepository,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @Inject(VAULT_CONFIG) private readonly config: VaultConfig,
  ) {}

  async execute(input: SetDailyFocusInput): Promise<SetDailyFocusOutput> {
    const date = input.date || dayjs().format('YYYY-MM-DD');
    const notePath = `${this.config.dailyFolder}/${date}.md`;

    if (!(await this.vault.fileExists(notePath))) {
      throw new Error(`Daily note not found: ${notePath}`);
    }

    const content = await this.vault.readFile(notePath);
    const lines = content.split('\n');

    // Find the focus section and replace numbered items
    const focusHeader = lines.findIndex((l) =>
      l.includes('Enfoque del Dia (Top 3)'),
    );

    if (focusHeader === -1) {
      throw new Error('Focus section not found in daily note');
    }

    // Find where numbered items start after the header
    let firstItemLine = focusHeader + 1;
    while (firstItemLine < lines.length && !lines[firstItemLine].match(/^\d+\./)) {
      firstItemLine++;
    }

    // Replace up to 3 numbered items
    const focusItems = input.focus.slice(0, 3);
    for (let i = 0; i < 3; i++) {
      const lineIdx = firstItemLine + i;
      if (lineIdx < lines.length && lines[lineIdx].match(/^\d+\./)) {
        lines[lineIdx] = `${i + 1}. ${focusItems[i] || ''}`;
      }
    }

    await this.vault.writeFile(notePath, lines.join('\n'));
    this.logger.info('Daily focus updated', { date, focus: focusItems });

    return { path: notePath, focus: focusItems };
  }
}
