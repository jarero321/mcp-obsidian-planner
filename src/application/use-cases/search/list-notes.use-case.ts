import { Inject, Injectable } from '@nestjs/common';
import {
  VAULT_REPOSITORY,
  VaultRepository,
} from '@application/ports';

export interface ListNotesInput {
  folder: string;
  pattern?: string;
}

export interface ListNotesOutput {
  files: string[];
  totalCount: number;
}

@Injectable()
export class ListNotesUseCase {
  constructor(
    @Inject(VAULT_REPOSITORY) private readonly vault: VaultRepository,
  ) {}

  async execute(input: ListNotesInput): Promise<ListNotesOutput> {
    const files = await this.vault.listFiles(input.folder, input.pattern);
    return { files, totalCount: files.length };
  }
}
