import { Inject, Injectable } from '@nestjs/common';
import { readFile, writeFile, access, readdir, stat } from 'fs/promises';
import { join, resolve, relative, extname } from 'path';
import { VAULT_CONFIG, VaultConfig } from '@config/vault.config';
import { VaultRepository, SearchResult } from '@application/ports';

@Injectable()
export class FsVaultRepository implements VaultRepository {
  constructor(
    @Inject(VAULT_CONFIG)
    private readonly config: VaultConfig,
  ) {}

  private resolveSafe(relativePath: string): string {
    const resolved = resolve(this.config.vaultPath, relativePath);
    const rel = relative(this.config.vaultPath, resolved);
    if (rel.startsWith('..')) {
      throw new Error(`Path traversal detected: ${relativePath}`);
    }
    return resolved;
  }

  async readFile(relativePath: string): Promise<string> {
    const fullPath = this.resolveSafe(relativePath);
    return readFile(fullPath, 'utf-8');
  }

  async writeFile(relativePath: string, content: string): Promise<void> {
    const fullPath = this.resolveSafe(relativePath);
    await writeFile(fullPath, content, 'utf-8');
  }

  async fileExists(relativePath: string): Promise<boolean> {
    try {
      const fullPath = this.resolveSafe(relativePath);
      await access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async listFiles(folder: string, pattern?: string): Promise<string[]> {
    const fullPath = this.resolveSafe(folder);
    const results: string[] = [];

    const walkDir = async (dir: string): Promise<void> => {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const entryPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!entry.name.startsWith('.')) {
            await walkDir(entryPath);
          }
        } else if (extname(entry.name) === '.md') {
          const rel = relative(this.config.vaultPath, entryPath);
          if (!pattern || entry.name.includes(pattern)) {
            results.push(rel);
          }
        }
      }
    };

    await walkDir(fullPath);
    return results.sort();
  }

  async searchContent(
    query: string,
    folder?: string,
  ): Promise<SearchResult[]> {
    const searchFolder = folder || '';
    const files = await this.listFiles(searchFolder);
    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    for (const file of files) {
      const content = await this.readFile(file);
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(lowerQuery)) {
          const contextStart = Math.max(0, i - 2);
          const contextEnd = Math.min(lines.length - 1, i + 2);
          const context = lines.slice(contextStart, contextEnd + 1);

          results.push({
            path: file,
            line: i + 1,
            content: lines[i].trim(),
            context,
          });
        }
      }
    }

    return results;
  }

  async replaceLine(
    relativePath: string,
    lineNumber: number,
    newContent: string,
  ): Promise<void> {
    const content = await this.readFile(relativePath);
    const lines = content.split('\n');

    if (lineNumber < 1 || lineNumber > lines.length) {
      throw new Error(
        `Line ${lineNumber} out of range (1-${lines.length})`,
      );
    }

    lines[lineNumber - 1] = newContent;
    await this.writeFile(relativePath, lines.join('\n'));
  }

  async appendToSection(
    relativePath: string,
    sectionHeader: string,
    content: string,
  ): Promise<void> {
    const fileContent = await this.readFile(relativePath);
    const lines = fileContent.split('\n');

    let sectionIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('#') && lines[i].includes(sectionHeader)) {
        sectionIndex = i;
        break;
      }
    }

    if (sectionIndex === -1) {
      throw new Error(`Section "${sectionHeader}" not found in ${relativePath}`);
    }

    let insertIndex = sectionIndex + 1;
    while (insertIndex < lines.length) {
      const line = lines[insertIndex];
      if (line.startsWith('## ') || line.startsWith('# ') || line === '---') {
        break;
      }
      insertIndex++;
    }

    // Insert before the separator/next section
    lines.splice(insertIndex, 0, content);
    await this.writeFile(relativePath, lines.join('\n'));
  }
}
