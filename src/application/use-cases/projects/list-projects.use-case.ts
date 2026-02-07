import { Inject, Injectable } from '@nestjs/common';
import { VAULT_CONFIG, VaultConfig } from '@config/vault.config';
import {
  VAULT_REPOSITORY,
  VaultRepository,
  NOTE_PARSER,
  NoteParser,
} from '@application/ports';
import { Project } from '@domain/entities';
import { ProjectStatus } from '@domain/enums';

export interface ListProjectsInput {
  status?: ProjectStatus;
  area?: string;
}

export interface ListProjectsOutput {
  projects: Project[];
  totalCount: number;
}

@Injectable()
export class ListProjectsUseCase {
  constructor(
    @Inject(VAULT_REPOSITORY) private readonly vault: VaultRepository,
    @Inject(NOTE_PARSER) private readonly parser: NoteParser,
    @Inject(VAULT_CONFIG) private readonly config: VaultConfig,
  ) {}

  async execute(input: ListProjectsInput): Promise<ListProjectsOutput> {
    const files = await this.vault.listFiles(this.config.projectsFolder);
    let projects: Project[] = [];

    for (const file of files) {
      const content = await this.vault.readFile(file);
      const frontmatter = this.parser.parseFrontmatter(content);
      const tasks = this.parser.parseTasks(content, file);
      const sections = this.parser.parseSections(content);

      projects.push(
        new Project({
          name: file.split('/').pop()?.replace('.md', '') || file,
          path: file,
          status: (frontmatter.estado as ProjectStatus) || ProjectStatus.NOT_STARTED,
          startDate: String(frontmatter.inicio || ''),
          deadline: String(frontmatter.deadline || ''),
          area: String(frontmatter.area || ''),
          objective: sections.get('Objetivo') || '',
          tasks,
        }),
      );
    }

    if (input.status) {
      projects = projects.filter((p) => p.status === input.status);
    }

    if (input.area) {
      projects = projects.filter((p) => p.area === input.area);
    }

    return { projects, totalCount: projects.length };
  }
}
