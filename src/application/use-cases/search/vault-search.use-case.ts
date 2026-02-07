import { Inject, Injectable } from '@nestjs/common';
import {
  VAULT_REPOSITORY,
  VaultRepository,
  SearchResult,
} from '@application/ports';

export interface VaultSearchInput {
  query: string;
  folder?: string;
  limit?: number;
}

export interface VaultSearchOutput {
  results: SearchResult[];
  totalCount: number;
  query: string;
}

@Injectable()
export class VaultSearchUseCase {
  constructor(
    @Inject(VAULT_REPOSITORY) private readonly vault: VaultRepository,
  ) {}

  async execute(input: VaultSearchInput): Promise<VaultSearchOutput> {
    const results = await this.vault.searchContent(
      input.query,
      input.folder,
    );

    const limit = input.limit || 20;
    const limited = results.slice(0, limit);

    return {
      results: limited,
      totalCount: results.length,
      query: input.query,
    };
  }
}
