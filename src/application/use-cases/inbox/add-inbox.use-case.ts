import { Inject, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { VAULT_CONFIG, VaultConfig } from '@config/vault.config';
import {
  VAULT_REPOSITORY,
  VaultRepository,
  LOGGER_PORT,
  LoggerPort,
} from '@application/ports';
import { InboxPriority } from '@domain/enums';

export interface AddInboxInput {
  text: string;
  isTask?: boolean;
  priority?: InboxPriority;
}

export interface AddInboxOutput {
  text: string;
  priority: InboxPriority;
  timestamp: string;
}

const PRIORITY_SECTION_MAP: Record<InboxPriority, string> = {
  [InboxPriority.QUICK_CAPTURE]: 'Captura Rápida',
  [InboxPriority.URGENT]: 'Urgente (hacer esta semana)',
  [InboxPriority.CAN_WAIT]: 'Puede esperar',
  [InboxPriority.SOMEDAY]: 'Algún día / Quizás',
  [InboxPriority.QUICK_NOTES]: 'Notas Rápidas',
};

@Injectable()
export class AddInboxUseCase {
  constructor(
    @Inject(VAULT_REPOSITORY) private readonly vault: VaultRepository,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @Inject(VAULT_CONFIG) private readonly config: VaultConfig,
  ) {}

  async execute(input: AddInboxInput): Promise<AddInboxOutput> {
    const priority = input.priority || InboxPriority.QUICK_CAPTURE;
    const isTask = input.isTask !== false;
    const timestamp = dayjs().format('YYYY-MM-DD HH:mm');

    const prefix = isTask ? '- [ ] ' : '- ';
    const line = `${prefix}${input.text} _${timestamp}_`;

    const sectionName = PRIORITY_SECTION_MAP[priority];
    await this.vault.appendToSection(
      this.config.inboxFile,
      sectionName,
      line,
    );

    this.logger.info('Item added to inbox', { text: input.text, priority });

    return { text: input.text, priority, timestamp };
  }
}
