import { Inject, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { VAULT_CONFIG, VaultConfig } from '@config/vault.config';
import {
  VAULT_REPOSITORY,
  VaultRepository,
  TEMPLATE_ENGINE,
  TemplateEngine,
  LOGGER_PORT,
  LoggerPort,
} from '@application/ports';

dayjs.extend(weekOfYear);

export interface CreateWeeklyInput {
  date?: string;
}

export interface CreateWeeklyOutput {
  path: string;
  content: string;
  created: boolean;
}

@Injectable()
export class CreateWeeklyUseCase {
  constructor(
    @Inject(VAULT_REPOSITORY) private readonly vault: VaultRepository,
    @Inject(TEMPLATE_ENGINE) private readonly template: TemplateEngine,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @Inject(VAULT_CONFIG) private readonly config: VaultConfig,
  ) {}

  async execute(input: CreateWeeklyInput): Promise<CreateWeeklyOutput> {
    const date = input.date || dayjs().format('YYYY-MM-DD');
    const d = dayjs(date);
    const weekLabel = d.format('YYYY-[W]') + String(d.week()).padStart(2, '0');
    const notePath = `${this.config.dailyFolder}/Weekly Review - ${weekLabel}.md`;

    if (await this.vault.fileExists(notePath)) {
      const content = await this.vault.readFile(notePath);
      this.logger.info('Weekly review already exists', { path: notePath });
      return { path: notePath, content, created: false };
    }

    const templatePath = `${this.config.templatesFolder}/Template - Weekly Review.md`;
    const templateContent = await this.vault.readFile(templatePath);
    const rendered = this.template.renderWeeklyReview(templateContent, date);

    await this.vault.writeFile(notePath, rendered);
    this.logger.info('Weekly review created', { path: notePath });

    return { path: notePath, content: rendered, created: true };
  }
}
