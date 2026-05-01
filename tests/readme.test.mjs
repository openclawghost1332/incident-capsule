import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { readmePath } from './helpers/fixture-paths.mjs';

test('README documents pack usage, output formats, and the richer capsule artifact contract', async () => {
  const readme = await readFile(readmePath, 'utf8');

  assert.match(readme, /incident-capsule pack --input/);
  assert.match(readme, /--format json/);
  assert.match(readme, /--format capsule/);
  assert.match(readme, /version\s*2/i);
  assert.match(readme, /content field/i);
  assert.match(readme, /sample report/i);
});
