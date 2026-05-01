import test from 'node:test';
import assert from 'node:assert/strict';

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
