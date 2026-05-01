# incident-capsule

Turn a messy incident folder into a deterministic portable report.

Incident Capsule scans one directory recursively, preserves what it could and could not understand, extracts a compact timeline plus repeated error signatures, and emits the same structured JSON contract to both CLI output and the static sample report.

## Features

- recursive ingestion for markdown, logs, text, JSON, and image inventory artifacts
- visible warnings for malformed JSON, ignored binary/image files, and truncated excerpts
- derived summary counts for processed, ignored, and warning-bearing artifacts
- repeated signature grouping and basic service or owner hints
- table, markdown, and JSON CLI outputs
- static browser report powered by `sample/report.json`

## Install

```bash
npm install
```

## CLI

```bash
node ./bin/incident-capsule.js pack --input ./sample/incidents/demo-incident --format table
node ./bin/incident-capsule.js pack --input ./sample/incidents/demo-incident --format markdown
node ./bin/incident-capsule.js pack --input ./sample/incidents/demo-incident --format json
```

The packaged command shape is:

```bash
incident-capsule pack --input <dir> --format table|json|markdown
```

## Sample report

Generate the saved sample report from the committed fixture with:

```bash
npm run sample
```

Then serve the repo statically and open `index.html` to view the browser report powered by `sample/report.json`.

## Output contract

The shared report schema starts with:

```json
{
  "kind": "incident-capsule-report",
  "version": "1"
}
```

Warnings are first-class. Malformed JSON stays visible as `malformed-json`, and binary or image artifacts stay visible as ignored entries instead of disappearing.

## Development

```bash
npm test
git diff --check
```
