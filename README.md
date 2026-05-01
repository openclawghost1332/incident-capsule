# Incident Capsule

Incident Capsule is a deterministic Node CLI plus static browser report for turning a messy incident folder into one portable, reviewable report.

It ingests mixed artifacts such as markdown notes, logs, JSON, and ignored binary/image files, then emits:
- a versioned `incident-capsule` artifact model
- a shared `incident-capsule-report` contract for CLI and browser rendering
- visible warnings for malformed JSON and ignored artifacts
- timeline events, repeated signatures, and service/owner hints

## Why it exists

During an incident, the evidence usually lives in a rough folder, not a clean system. Incident Capsule gives responders a deterministic way to pack that folder into something portable enough to hand off, inspect in a terminal, or open in a browser.

## Usage

```bash
npm test
./bin/incident-capsule.js pack --input ./sample/incidents/demo-incident --format table
./bin/incident-capsule.js pack --input ./sample/incidents/demo-incident --format json
./bin/incident-capsule.js pack --input ./sample/incidents/demo-incident --format markdown
./bin/incident-capsule.js pack --input ./sample/incidents/demo-incident --format capsule
npm run sample
```

If you expose the bin on your PATH, the equivalent command is `incident-capsule pack --input ./sample/incidents/demo-incident --format json`.

## Output formats

- `--format table` prints a terminal summary.
- `--format json` prints the full portable `incident-capsule-report` JSON.
- `--format markdown` prints a handoff-friendly markdown summary.
- `--format capsule` prints the raw `incident-capsule` artifact, including preserved excerpts and parsed JSON, for downstream tools.

For Stack Sleuth interop today, the source incident folder should use Stack Sleuth-style filenames such as `current.log`, `baseline.log`, `candidate.log`, `timeline.log`, or `notebook.md` so the downstream capsule router has deterministic workflow inputs.

## Sample report

`npm run sample` regenerates `sample/report.json` from the committed demo incident. Open `index.html` in a static server to inspect the same sample report in the browser.

## Fixture coverage

The committed sample incident includes:
- markdown notes with timestamps and owner hints
- log lines with repeated signatures
- valid telemetry JSON
- malformed JSON that stays visible as a warning-bearing artifact
- an ignored screenshot artifact that still appears in the report

## Development

This repo uses the built-in Node test runner.

```bash
npm test
```
