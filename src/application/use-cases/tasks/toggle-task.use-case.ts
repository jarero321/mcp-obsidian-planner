import { Inject, Injectable } from '@nestjs/common';
import {
  VAULT_REPOSITORY,
  VaultRepository,
  NOTE_PARSER,
  NoteParser,
  LOGGER_PORT,
  LoggerPort,
} from '@application/ports';
import { TaskStatus } from '@domain/enums';

export interface ToggleTaskInput {
  sourcePath: string;
  lineNumber: number;
}

export interface ToggleTaskOutput {
  text: string;
  newStatus: TaskStatus;
}

@Injectable()
export class ToggleTaskUseCase {
  constructor(
    @Inject(VAULT_REPOSITORY) private readonly vault: VaultRepository,
    @Inject(NOTE_PARSER) private readonly parser: NoteParser,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  async execute(input: ToggleTaskInput): Promise<ToggleTaskOutput> {
    const content = await this.vault.readFile(input.sourcePath);
    const lines = content.split('\n');
    const line = lines[input.lineNumber - 1];

    if (!line) {
      throw new Error(`Line ${input.lineNumber} not found in ${input.sourcePath}`);
    }

    let newLine: string;
    let newStatus: TaskStatus;

    if (line.includes('- [ ]')) {
      newLine = line.replace('- [ ]', '- [x]');
      newStatus = TaskStatus.COMPLETED;
    } else if (line.includes('- [x]')) {
      newLine = line.replace('- [x]', '- [ ]');
      newStatus = TaskStatus.PENDING;
    } else {
      throw new Error(`Line ${input.lineNumber} is not a task`);
    }

    await this.vault.replaceLine(input.sourcePath, input.lineNumber, newLine);

    const text = line.replace(/^(\s*)- \[.\] /, '').trim();
    this.logger.info('Task toggled', {
      path: input.sourcePath,
      lineNumber: input.lineNumber,
      newStatus,
    });

    return { text, newStatus };
  }
}
