import { Global, Module } from '@nestjs/common';
import { VAULT_REPOSITORY } from '@application/ports';
import { FsVaultRepository } from './fs-vault.repository';

@Global()
@Module({
  providers: [
    FsVaultRepository,
    {
      provide: VAULT_REPOSITORY,
      useExisting: FsVaultRepository,
    },
  ],
  exports: [VAULT_REPOSITORY],
})
export class VaultModule {}
