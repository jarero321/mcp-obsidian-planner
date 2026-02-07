import { Inject, Injectable } from '@nestjs/common';
import { VAULT_CONFIG, VaultConfig } from '@config/vault.config';
import {
  VAULT_REPOSITORY,
  VaultRepository,
  LOGGER_PORT,
  LoggerPort,
} from '@application/ports';
import { InboxPriority } from '@domain/enums';

export interface PrioritizeInboxInput {
  lineNumber: number;
  newPriority: InboxPriority;
}

export interface PrioritizeInboxOutput {
  itemText: string;
  newPriority: InboxPriority;
}

const PRIORITY_SECTION_MAP: Record<InboxPriority, string> = {
  [InboxPriority.QUICK_CAPTURE]: 'Captura Rápida',
  [InboxPriority.URGENT]: 'Urgente (hacer esta semana)',
  [InboxPriority.CAN_WAIT]: 'Puede esperar',
  [InboxPriority.SOMEDAY]: 'Algún día / Quizás',
  [InboxPriority.QUICK_NOTES]: 'Notas Rápidas',
};

@Injectable()
export class PrioritizeInboxUseCase {
  constructor(
    @Inject(VAULT_REPOSITORY) private readonly vault: VaultRepository,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @Inject(VAULT_CONFIG) private readonly config: VaultConfig,
  ) {}

  async execute(input: PrioritizeInboxInput): Promise<PrioritizeInboxOutput> {
    const content = await this.vault.readFile(this.config.inboxFile);
    const lines = content.split('\n');

    if (input.lineNumber < 1 || input.lineNumber > lines.length) {
      throw new Error(`Line ${input.lineNumber} out of range`);
    }

    const itemLine = lines[input.lineNumber - 1];
    const itemText = itemLine.replace(/^-\s*(\[.\]\s*)?/, '').trim();

    // Remove from current position
    lines.splice(input.lineNumber - 1, 1);
    await this.vault.writeFile(this.config.inboxFile, lines.join('\n'));

    // Add to new priority section
    const sectionName = PRIORITY_SECTION_MAP[input.newPriority];
    await this.vault.appendToSection(
      this.config.inboxFile,
      sectionName,
      itemLine,
    );

    this.logger.info('Inbox item reprioritized', {
      itemText,
      newPriority: input.newPriority,
    });

    return { itemText, newPriority: input.newPriority };
  }
}
