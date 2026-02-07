import { resolve, relative } from 'path';

export class VaultPath {
  public readonly absolute: string;

  constructor(
    private readonly vaultRoot: string,
    relativePath: string,
  ) {
    const resolved = resolve(vaultRoot, relativePath);
    const rel = relative(vaultRoot, resolved);

    if (rel.startsWith('..') || resolve(resolved) !== resolved.replace(/\/$/, '')) {
      throw new Error(`Path traversal detected: ${relativePath}`);
    }

    this.absolute = resolved;
  }

  get relative(): string {
    return relative(this.vaultRoot, this.absolute);
  }

  toString(): string {
    return this.absolute;
  }
}
