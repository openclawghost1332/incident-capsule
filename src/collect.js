import { promises as fs } from 'node:fs';
import path from 'node:path';

const TEXT_KINDS = new Set(['log', 'markdown', 'json']);

export function inferArtifactKind(relativePath) {
  const lowerPath = relativePath.toLowerCase();

  if (lowerPath.endsWith('.log') || lowerPath.endsWith('.txt') || lowerPath.endsWith('.casebook')) return 'log';
  if (lowerPath.endsWith('.md')) return 'markdown';
  if (lowerPath.endsWith('.json')) return 'json';
  if (lowerPath.endsWith('.png') || lowerPath.endsWith('.jpg') || lowerPath.endsWith('.jpeg') || lowerPath.endsWith('.webp') || lowerPath.endsWith('.gif')) return 'image';

  return 'unknown';
}

async function walkDirectory(rootPath, currentPath = rootPath) {
  const entries = await fs.readdir(currentPath, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));

  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(currentPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkDirectory(rootPath, entryPath)));
      continue;
    }

    if (entry.isFile()) {
      const stats = await fs.stat(entryPath);
      const relativePath = path.relative(rootPath, entryPath).split(path.sep).join('/');
      const kind = inferArtifactKind(relativePath);

      files.push({
        absolutePath: entryPath,
        relativePath,
        kind,
        supported: TEXT_KINDS.has(kind),
        size: stats.size,
        modifiedAt: new Date(stats.mtimeMs).toISOString(),
      });
    }
  }

  return files;
}

export async function collectArtifacts({ inputPath }) {
  const stats = await fs.stat(inputPath).catch(() => null);

  if (!stats) {
    throw new Error(`Input path does not exist: ${inputPath}`);
  }

  if (!stats.isDirectory()) {
    throw new Error(`Input path is not a directory: ${inputPath}`);
  }

  return walkDirectory(inputPath);
}
