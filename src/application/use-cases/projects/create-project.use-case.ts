import { Inject, Injectable } from '@nestjs/common';
import { VAULT_CONFIG, VaultConfig } from '@config/vault.config';
import {
  VAULT_REPOSITORY,
  VaultRepository,
  TEMPLATE_ENGINE,
  TemplateEngine,
  LOGGER_PORT,
  LoggerPort,
} from '@application/ports';

export interface CreateProjectInput {
  name: string;
  area: string;
}

export interface CreateProjectOutput {
  path: string;
  name: string;
  area: string;
  created: boolean;
}

@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject(VAULT_REPOSITORY) private readonly vault: VaultRepository,
    @Inject(TEMPLATE_ENGINE) private readonly template: TemplateEngine,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @Inject(VAULT_CONFIG) private readonly config: VaultConfig,
  ) {}

  async execute(input: CreateProjectInput): Promise<CreateProjectOutput> {
    const projectPath = `${this.config.projectsFolder}/${input.name}.md`;

    if (await this.vault.fileExists(projectPath)) {
      this.logger.info('Project already exists', { name: input.name });
      return {
        path: projectPath,
        name: input.name,
        area: input.area,
        created: false,
      };
    }

    const templatePath = `${this.config.templatesFolder}/Template - Proyecto.md`;
    const templateContent = await this.vault.readFile(templatePath);
    const rendered = this.template.renderProject(
      templateContent,
      input.name,
      input.area,
    );

    await this.vault.writeFile(projectPath, rendered);
    this.logger.info('Project created', { name: input.name, area: input.area });

    return {
      path: projectPath,
      name: input.name,
      area: input.area,
      created: true,
    };
  }
}
