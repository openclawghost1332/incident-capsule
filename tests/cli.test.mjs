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

test('CLI emits the raw capsule v2 artifact with preserved content when --format capsule is used', async () => {
  const result = runCli(['pack', '--input', demoIncidentPath, '--format', 'capsule']);
  assert.equal(result.status, 0, result.stderr);
  const parsed = JSON.parse(result.stdout);
  const history = parsed.artifacts.find((artifact) => artifact.relativePath === 'history.casebook');
  const telemetry = parsed.artifacts.find((artifact) => artifact.relativePath === 'telemetry.json');
  assert.equal(parsed.kind, 'incident-capsule');
  assert.equal(parsed.version, '2');
  assert.ok(Array.isArray(parsed.artifacts));
  assert.equal(history.kind, 'log');
  assert.equal(typeof history.content, 'string');
  assert.match(history.content, /release-2026-04-15/);
  assert.equal(typeof telemetry.content, 'string');
  assert.deepEqual(JSON.parse(telemetry.content), telemetry.parsed);
});

test('CLI rejects unknown formats with a non-zero exit code', async () => {
  const result = runCli(['pack', '--input', demoIncidentPath, '--format', 'xml']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown format/);
});
