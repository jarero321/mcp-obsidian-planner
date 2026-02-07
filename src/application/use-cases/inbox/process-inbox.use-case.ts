import { Inject, Injectable } from '@nestjs/common';
import { VAULT_CONFIG, VaultConfig } from '@config/vault.config';
import {
  VAULT_REPOSITORY,
  VaultRepository,
  LOGGER_PORT,
  LoggerPort,
} from '@application/ports';

export interface ProcessInboxInput {
  lineNumber: number;
  destination: 'project' | 'daily' | 'area' | 'archive' | 'delete';
  targetPath?: string;
}

export interface ProcessInboxOutput {
  action: string;
  itemText: string;
}

@Injectable()
export class ProcessInboxUseCase {
  constructor(
    @Inject(VAULT_REPOSITORY) private readonly vault: VaultRepository,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @Inject(VAULT_CONFIG) private readonly config: VaultConfig,
  ) {}

  async execute(input: ProcessInboxInput): Promise<ProcessInboxOutput> {
    const content = await this.vault.readFile(this.config.inboxFile);
    const lines = content.split('\n');

    if (input.lineNumber < 1 || input.lineNumber > lines.length) {
      throw new Error(`Line ${input.lineNumber} out of range`);
    }

    const itemLine = lines[input.lineNumber - 1];
    const itemText = itemLine.replace(/^-\s*(\[.\]\s*)?/, '').trim();

    if (input.destination === 'delete') {
      lines.splice(input.lineNumber - 1, 1);
      await this.vault.writeFile(this.config.inboxFile, lines.join('\n'));
      this.logger.info('Inbox item deleted', { lineNumber: input.lineNumber });
      return { action: 'deleted', itemText };
    }

    if (input.destination === 'archive') {
      lines.splice(input.lineNumber - 1, 1);
      await this.vault.writeFile(this.config.inboxFile, lines.join('\n'));
      const archivePath = `${this.config.archiveFolder}/Inbox Archive.md`;
      const exists = await this.vault.fileExists(archivePath);
      if (!exists) {
        await this.vault.writeFile(archivePath, `# Inbox Archive\n\n${itemLine}\n`);
      } else {
        const archiveContent = await this.vault.readFile(archivePath);
        await this.vault.writeFile(archivePath, archiveContent + `\n${itemLine}`);
      }
      this.logger.info('Inbox item archived', { itemText });
      return { action: 'archived', itemText };
    }

    // Move to target (project, daily, area)
    if (!input.targetPath) {
      throw new Error('targetPath required for project/daily/area destination');
    }

    const taskLine = `- [ ] ${itemText}`;
    await this.vault.appendToSection(input.targetPath, 'Tareas', taskLine);

    lines.splice(input.lineNumber - 1, 1);
    await this.vault.writeFile(this.config.inboxFile, lines.join('\n'));

    this.logger.info('Inbox item moved', {
      destination: input.destination,
      targetPath: input.targetPath,
    });

    return {
      action: `moved to ${input.destination}`,
      itemText,
    };
  }
}
