import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { demoIncidentPath } from './helpers/fixture-paths.mjs';
import { buildCapsule } from '../src/normalize.js';

test('buildCapsule preserves malformed json and ignored images as visible warning-bearing artifacts', async () => {
  const capsule = await buildCapsule({ inputPath: demoIncidentPath });

  const badJson = capsule.artifacts.find((artifact) => artifact.relativePath === 'bad.json');
  const screenshot = capsule.artifacts.find((artifact) => artifact.relativePath === 'screenshots/checkout.png');

  assert.equal(badJson.kind, 'malformed-json');
  assert.match(badJson.warnings.join(' '), /Unexpected token|Expected/);
  assert.equal(screenshot.kind, 'ignored-binary');
  assert.match(capsule.summary.warningCount.toString(), /[1-9]/);
});

test('buildCapsule parses full JSON before excerpting large files', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'incident-capsule-large-json-'));
  const payload = {
    service: 'checkout-api',
    owner: 'payments-oncall',
    events: [{ timestamp: '2026-04-30T12:03:00Z', summary: 'latency crossed 2s' }],
    padding: 'x'.repeat(5000),
  };

  await writeFile(path.join(tempDir, 'telemetry.json'), JSON.stringify(payload), 'utf8');
  const capsule = await buildCapsule({ inputPath: tempDir });
  const telemetry = capsule.artifacts.find((artifact) => artifact.relativePath === 'telemetry.json');

  assert.equal(telemetry.kind, 'json');
  assert.equal(telemetry.parsed.service, 'checkout-api');
  assert.match(telemetry.warnings.join(' '), /Excerpt truncated/);
});
