import test from 'node:test';
import assert from 'node:assert/strict';

import { renderMarkdown, renderTable } from '../src/render.js';

const sampleReport = {
  kind: 'incident-capsule-report',
  version: '1',
  summary: {
    artifactCount: 5,
    processedCount: 4,
    ignoredCount: 1,
    warningCount: 2,
  },
  analysis: {
    signatures: [
      {
        signature: 'TypeError: Cannot read properties of undefined',
        count: 2,
      },
    ],
    timeline: [
      {
        timestamp: '2026-04-30T12:01:00Z',
        summary: 'deploy started for checkout-api',
        source: 'notes.md',
      },
    ],
    serviceHints: ['checkout-api'],
    ownerHints: ['payments-oncall'],
  },
  artifacts: [
    {
      relativePath: 'bad.json',
      kind: 'malformed-json',
      warnings: ['Unexpected token } in JSON at position 38'],
    },
  ],
};

test('renderTable prints summary counts, top signatures, and warnings', () => {
  const output = renderTable(sampleReport);
  assert.match(output, /Incident Capsule/);
  assert.match(output, /warning/i);
  assert.match(output, /TypeError: Cannot read properties of undefined/);
});

test('renderMarkdown prints a portable markdown summary', () => {
  const output = renderMarkdown(sampleReport);
  assert.match(output, /# Incident Capsule/);
  assert.match(output, /checkout-api/);
  assert.match(output, /bad\.json/);
});
