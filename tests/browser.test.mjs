import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { sampleReportPath } from './helpers/fixture-paths.mjs';
import { renderBrowserReport } from '../src/browser.js';

test('browser renderer turns the saved sample report into visible summary sections', async () => {
  const report = JSON.parse(await readFile(sampleReportPath, 'utf8'));
  const html = renderBrowserReport(report);

  assert.match(html, /Incident Capsule/);
  assert.match(html, /checkout-api/);
  assert.match(html, /TypeError: Cannot read properties of undefined/);
  assert.match(html, /bad\.json/);
});
