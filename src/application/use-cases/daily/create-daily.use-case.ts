import { Inject, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { VAULT_CONFIG, VaultConfig } from '@config/vault.config';
import {
  VAULT_REPOSITORY,
  VaultRepository,
  TEMPLATE_ENGINE,
  TemplateEngine,
  LOGGER_PORT,
  LoggerPort,
} from '@application/ports';

export interface CreateDailyInput {
  date?: string;
}

export interface CreateDailyOutput {
  path: string;
  content: string;
  created: boolean;
}

@Injectable()
export class CreateDailyUseCase {
  constructor(
    @Inject(VAULT_REPOSITORY) private readonly vault: VaultRepository,
    @Inject(TEMPLATE_ENGINE) private readonly template: TemplateEngine,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @Inject(VAULT_CONFIG) private readonly config: VaultConfig,
  ) {}

  async execute(input: CreateDailyInput): Promise<CreateDailyOutput> {
    const date = input.date || dayjs().format('YYYY-MM-DD');
    const notePath = `${this.config.dailyFolder}/${date}.md`;

    if (await this.vault.fileExists(notePath)) {
      const content = await this.vault.readFile(notePath);
      this.logger.info('Daily note already exists', { date, path: notePath });
      return { path: notePath, content, created: false };
    }

    const templatePath = `${this.config.templatesFolder}/Template - Daily Note.md`;
    const templateContent = await this.vault.readFile(templatePath);
    const rendered = this.template.renderDailyNote(templateContent, date);

    await this.vault.writeFile(notePath, rendered);
    this.logger.info('Daily note created', { date, path: notePath });

    return { path: notePath, content: rendered, created: true };
  }
}
