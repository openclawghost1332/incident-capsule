import { analyzeCapsule } from './analyze.js';
import { buildCapsule } from './normalize.js';

const REPORT_KIND = 'incident-capsule-report';
const REPORT_VERSION = '1';

function formatWarnings(report) {
  return report.artifacts
    .filter((artifact) => Array.isArray(artifact.warnings) && artifact.warnings.length > 0)
    .map((artifact) => `- ${artifact.relativePath}: ${artifact.warnings.join('; ')}`)
    .join('\n');
}

export async function buildReport({ inputPath, sourceLabel }) {
  const capsule = await buildCapsule({ inputPath, sourceLabel });
  const analysis = analyzeCapsule(capsule);

  return {
    kind: REPORT_KIND,
    version: REPORT_VERSION,
    generatedAt: 'deterministic-fixture',
    source: capsule.source,
    summary: capsule.summary,
    analysis,
    artifacts: capsule.artifacts.map((artifact) => ({
      relativePath: artifact.relativePath,
      kind: artifact.kind,
      supported: artifact.supported,
      size: artifact.size,
      warnings: artifact.warnings,
    })),
  };
}

export function renderTable(report) {
  const signatureLines = report.analysis.signatures.length
    ? report.analysis.signatures.map((item) => `  - ${item.signature} (${item.count})`).join('\n')
    : '  - none';
  const warningLines = formatWarnings(report) || '- none';

  return [
    'Incident Capsule',
    `Kind: ${report.kind} v${report.version}`,
    '',
    `Artifacts: ${report.summary.artifactCount}`,
    `Processed: ${report.summary.processedCount}`,
    `Ignored: ${report.summary.ignoredCount}`,
    `Warnings: ${report.summary.warningCount}`,
    `Services: ${report.analysis.serviceHints.join(', ') || 'none'}`,
    `Owners: ${report.analysis.ownerHints.join(', ') || 'none'}`,
    '',
    'Top Signatures:',
    signatureLines,
    '',
    'Warnings:',
    warningLines,
    '',
  ].join('\n');
}

export function renderMarkdown(report) {
  const timeline = report.analysis.timeline
    .map((event) => `- ${event.timestamp} ${event.summary} (${event.source})`)
    .join('\n') || '- none';
  const warnings = formatWarnings(report) || '- none';
  const artifacts = report.artifacts
    .map((artifact) => `- \`${artifact.relativePath}\` (${artifact.kind})`)
    .join('\n');

  return [
    '# Incident Capsule',
    '',
    `- Kind: ${report.kind}`,
    `- Version: ${report.version}`,
    `- Services: ${report.analysis.serviceHints.join(', ') || 'none'}`,
    `- Owners: ${report.analysis.ownerHints.join(', ') || 'none'}`,
    `- Warnings: ${report.summary.warningCount}`,
    '',
    '## Timeline',
    timeline,
    '',
    '## Signatures',
    ...(report.analysis.signatures.length
      ? report.analysis.signatures.map((item) => `- ${item.signature} (${item.count})`)
      : ['- none']),
    '',
    '## Artifacts',
    artifacts,
    '',
    '## Warnings',
    warnings,
    '',
  ].join('\n');
}
