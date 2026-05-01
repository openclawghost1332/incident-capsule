import { promises as fs } from 'node:fs';

import { collectArtifacts } from './collect.js';

const CAPSULE_KIND = 'incident-capsule';
const CAPSULE_VERSION = '1';
const EXCERPT_LIMIT = 4000;

function withWarnings(artifact, warnings) {
  return {
    ...artifact,
    warnings,
  };
}

async function readTextArtifact(artifact) {
  const content = await fs.readFile(artifact.absolutePath, 'utf8');
  const excerpt = content.slice(0, EXCERPT_LIMIT);
  const warnings = [];

  if (content.length > EXCERPT_LIMIT) {
    warnings.push(`Excerpt truncated to ${EXCERPT_LIMIT} characters.`);
  }

  return {
    ...artifact,
    excerpt,
    warnings,
    contentLength: content.length,
  };
}

async function normalizeArtifact(artifact) {
  if (!artifact.supported) {
    return withWarnings(
      {
        ...artifact,
        kind: artifact.kind === 'image' ? 'ignored-binary' : 'ignored-unsupported',
      },
      ['Artifact type is not ingested in this release.']
    );
  }

  const textArtifact = await readTextArtifact(artifact);

  if (artifact.kind !== 'json') {
    return textArtifact;
  }

  try {
    const parsed = JSON.parse(textArtifact.excerpt);
    return {
      ...textArtifact,
      parsed,
    };
  } catch (error) {
    return {
      ...textArtifact,
      kind: 'malformed-json',
      warnings: [...textArtifact.warnings, error.message],
    };
  }
}

export async function buildCapsule({ inputPath }) {
  const collectedArtifacts = await collectArtifacts({ inputPath });
  const artifacts = [];

  for (const artifact of collectedArtifacts) {
    artifacts.push(await normalizeArtifact(artifact));
  }

  const warningCount = artifacts.reduce((count, artifact) => count + artifact.warnings.length, 0);
  const ignoredCount = artifacts.filter((artifact) => !artifact.supported).length;
  const processedCount = artifacts.length - ignoredCount;

  return {
    kind: CAPSULE_KIND,
    version: CAPSULE_VERSION,
    source: {
      inputPath,
    },
    artifacts,
    summary: {
      artifactCount: artifacts.length,
      processedCount,
      ignoredCount,
      warningCount,
      malformedCount: artifacts.filter((artifact) => artifact.kind === 'malformed-json').length,
    },
  };
}
