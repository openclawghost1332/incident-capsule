import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { demoIncidentPath } from './helpers/fixture-paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const cliPath = path.join(repoRoot, 'bin', 'incident-capsule.js');

function runCli(args) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
}

test('CLI emits JSON when --format json is used', async () => {
  const result = runCli(['pack', '--input', demoIncidentPath, '--format', 'json']);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).kind, 'incident-capsule-report');
});

test('CLI emits the raw capsule artifact when --format capsule is used', async () => {
  const result = runCli(['pack', '--input', demoIncidentPath, '--format', 'capsule']);
  assert.equal(result.status, 0, result.stderr);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.kind, 'incident-capsule');
  assert.equal(parsed.version, '1');
  assert.ok(Array.isArray(parsed.artifacts));
});

test('CLI rejects unknown formats with a non-zero exit code', async () => {
  const result = runCli(['pack', '--input', demoIncidentPath, '--format', 'xml']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown format/);
});
