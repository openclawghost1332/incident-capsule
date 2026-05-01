import test from 'node:test';
import assert from 'node:assert/strict';

import { demoIncidentPath } from './helpers/fixture-paths.mjs';
import { collectArtifacts } from '../src/collect.js';

test('collectArtifacts walks the fixture incident directory and classifies supported versus ignored files', async () => {
  const artifacts = await collectArtifacts({ inputPath: demoIncidentPath });

  assert.deepEqual(
    artifacts.map((artifact) => ({
      relativePath: artifact.relativePath,
      kind: artifact.kind,
      supported: artifact.supported,
    })),
    [
      { relativePath: 'bad.json', kind: 'json', supported: true },
      { relativePath: 'current.log', kind: 'log', supported: true },
      { relativePath: 'notes.md', kind: 'markdown', supported: true },
      { relativePath: 'screenshots/checkout.png', kind: 'image', supported: false },
      { relativePath: 'telemetry.json', kind: 'json', supported: true },
    ]
  );
});
