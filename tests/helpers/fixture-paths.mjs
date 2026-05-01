import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

export const demoIncidentPath = path.join(repoRoot, 'sample', 'incidents', 'demo-incident');
export const sampleReportPath = path.join(repoRoot, 'sample', 'report.json');
export const readmePath = path.join(repoRoot, 'README.md');
