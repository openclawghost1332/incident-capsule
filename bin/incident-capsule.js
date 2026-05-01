#!/usr/bin/env node

import { buildCapsule } from '../src/normalize.js';
import { buildReport, renderMarkdown, renderTable } from '../src/render.js';

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const parsed = { command, inputPath: null, format: 'table' };

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];

    if (token === '--input') {
      parsed.inputPath = rest[index + 1];
      index += 1;
      continue;
    }

    if (token === '--format') {
      parsed.format = rest[index + 1];
      index += 1;
    }
  }

  return parsed;
}

async function main() {
  const { command, inputPath, format } = parseArgs(process.argv.slice(2));

  if (command !== 'pack') {
    process.stderr.write('Usage: incident-capsule pack --input <dir> --format table|json|markdown|capsule\n');
    process.exitCode = 1;
    return;
  }

  if (!inputPath) {
    process.stderr.write('Missing required --input <dir> argument\n');
    process.exitCode = 1;
    return;
  }

  if (format === 'capsule') {
    const capsule = await buildCapsule({ inputPath });
    process.stdout.write(JSON.stringify(capsule, null, 2) + '\n');
    return;
  }

  const report = await buildReport({ inputPath });

  switch (format) {
    case 'json':
      process.stdout.write(JSON.stringify(report, null, 2) + '\n');
      return;
    case 'markdown':
      process.stdout.write(renderMarkdown(report));
      return;
    case 'table':
      process.stdout.write(renderTable(report));
      return;
    default:
      process.stderr.write(`Unknown format: ${format}\n`);
      process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
