import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { demoIncidentPath } from './helpers/fixture-paths.mjs';
import { buildCapsule } from '../src/normalize.js';

test('buildCapsule preserves malformed json raw content and ignored images as visible warning-bearing artifacts', async () => {
  const capsule = await buildCapsule({ inputPath: demoIncidentPath });

  const badJson = capsule.artifacts.find((artifact) => artifact.relativePath === 'bad.json');
  const screenshot = capsule.artifacts.find((artifact) => artifact.relativePath === 'screenshots/checkout.png');

  assert.equal(badJson.kind, 'malformed-json');
  assert.match(badJson.warnings.join(' '), /Unexpected token|Expected/);
  assert.equal(typeof badJson.content, 'string');
  assert.match(badJson.content, /"broken"\s*:\s*}/);
  assert.equal(screenshot.kind, 'ignored-binary');
  assert.match(capsule.summary.warningCount.toString(), /[1-9]/);
});

test('buildCapsule emits version 2 and preserves full content for supported text and json artifacts', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'incident-capsule-large-json-'));
  const payload = {
    service: 'checkout-api',
    owner: 'payments-oncall',
    events: [{ timestamp: '2026-04-30T12:03:00Z', summary: 'latency crossed 2s' }],
    padding: 'x'.repeat(5000),
  };
  const timelineContent = `2026-04-30T12:03:00Z latency crossed 2s\n${'x'.repeat(5000)}`;

  await writeFile(path.join(tempDir, 'telemetry.json'), JSON.stringify(payload), 'utf8');
  await writeFile(path.join(tempDir, 'timeline.log'), timelineContent, 'utf8');
  const capsule = await buildCapsule({ inputPath: tempDir });
  const telemetry = capsule.artifacts.find((artifact) => artifact.relativePath === 'telemetry.json');
  const timeline = capsule.artifacts.find((artifact) => artifact.relativePath === 'timeline.log');

  assert.equal(capsule.version, '2');
  assert.equal(telemetry.kind, 'json');
  assert.equal(telemetry.parsed.service, 'checkout-api');
  assert.equal(telemetry.content, JSON.stringify(payload));
  assert.equal(telemetry.excerpt, telemetry.content.slice(0, 4000));
  assert.match(telemetry.warnings.join(' '), /Excerpt truncated/);
  assert.equal(timeline.kind, 'log');
  assert.equal(timeline.content, timelineContent);
  assert.equal(timeline.excerpt, timelineContent.slice(0, 4000));
  assert.match(timeline.warnings.join(' '), /Excerpt truncated/);
});
