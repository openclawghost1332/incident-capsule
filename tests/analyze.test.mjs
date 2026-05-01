import test from 'node:test';
import assert from 'node:assert/strict';

import { demoIncidentPath } from './helpers/fixture-paths.mjs';
import { buildCapsule } from '../src/normalize.js';
import { analyzeCapsule } from '../src/analyze.js';

test('analyzeCapsule extracts timeline events and repeated error signatures from mixed artifacts', async () => {
  const capsule = await buildCapsule({ inputPath: demoIncidentPath });
  const analysis = analyzeCapsule(capsule);

  assert.equal(analysis.timeline[0].timestamp, '2026-04-30T12:01:00Z');
  assert.match(analysis.timeline[0].summary, /deploy started/i);
  assert.equal(analysis.signatures[0].signature, 'TypeError: Cannot read properties of undefined');
  assert.equal(analysis.signatures[0].count, 2);
  assert.deepEqual(analysis.serviceHints, ['checkout-api']);
  assert.deepEqual(analysis.ownerHints, ['payments-oncall']);
});
