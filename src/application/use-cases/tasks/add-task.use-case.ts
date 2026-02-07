import { Inject, Injectable } from '@nestjs/common';
import {
  VAULT_REPOSITORY,
  VaultRepository,
  LOGGER_PORT,
  LoggerPort,
} from '@application/ports';

export interface AddTaskInput {
  path: string;
  text: string;
  section?: string;
}

export interface AddTaskOutput {
  path: string;
  text: string;
}

@Injectable()
export class AddTaskUseCase {
  constructor(
    @Inject(VAULT_REPOSITORY) private readonly vault: VaultRepository,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  async execute(input: AddTaskInput): Promise<AddTaskOutput> {
    const section = input.section || 'Tareas';
    const taskLine = `- [ ] ${input.text}`;

    await this.vault.appendToSection(input.path, section, taskLine);

    this.logger.info('Task added', { path: input.path, text: input.text });

    return { path: input.path, text: input.text };
  }
}
