import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';

import { buildReport } from '../src/render.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const inputPath = path.join(repoRoot, 'sample', 'incidents', 'demo-incident');
const outputPath = path.join(repoRoot, 'sample', 'report.json');

const report = await buildReport({
  inputPath,
  sourceLabel: './sample/incidents/demo-incident',
});
report.generatedAt = 'sample-fixture';

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(report, null, 2) + '\n');

process.stdout.write(`Wrote ${outputPath}\n`);
