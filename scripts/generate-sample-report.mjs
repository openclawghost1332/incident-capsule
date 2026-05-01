import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildReport } from '../src/render.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const inputPath = path.join(repoRoot, 'sample', 'incidents', 'demo-incident');
const outputPath = path.join(repoRoot, 'sample', 'report.json');

const report = await buildReport({ inputPath });
report.generatedAt = 'sample-fixture';
report.source.inputPath = './sample/incidents/demo-incident';

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

console.log(outputPath);
