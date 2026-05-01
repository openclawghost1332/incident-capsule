const TIMESTAMP_PATTERN = /(20\d\d-\d\d-\d\dT\d\d:\d\d:\d\dZ)/;
const SERVICE_PATTERN = /service(?:=|: )([a-z0-9-]+)/i;
const OWNER_PATTERN = /owner(?:=|: )([a-z0-9-]+)/i;
const TYPE_ERROR_PATTERN = /(TypeError: .*?)(?:\s+(?:requestId|checkout|service|owner)=|$)/i;

export function toSignature(line) {
  return line
    .replace(/\d+/g, '#')
    .replace(/\([^)]*\)/g, '(...)')
    .trim();
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function parseTimelineFromText(artifact) {
  if (typeof artifact.excerpt !== 'string') {
    return [];
  }

  if (artifact.kind === 'json') {
    return [];
  }

  const timeline = [];
  const lines = artifact.excerpt.split(/\r?\n/);

  for (const line of lines) {
    const timestampMatch = line.match(TIMESTAMP_PATTERN);
    if (!timestampMatch) continue;

    timeline.push({
      timestamp: timestampMatch[1],
      summary: line.replace(timestampMatch[1], '').replace(/^[-*\s]+/, '').trim(),
      source: artifact.relativePath,
    });
  }

  return timeline;
}

function parseTimelineFromJson(artifact) {
  const events = artifact.parsed?.events;
  if (!Array.isArray(events)) return [];

  return events
    .filter((event) => event && typeof event.timestamp === 'string' && typeof event.summary === 'string')
    .map((event) => ({
      timestamp: event.timestamp,
      summary: event.summary,
      source: artifact.relativePath,
    }));
}

function collectHintsFromText(artifact, matcher) {
  if (typeof artifact.excerpt !== 'string') {
    return [];
  }

  return artifact.excerpt
    .split(/\r?\n/)
    .map((line) => line.match(matcher)?.[1])
    .filter(Boolean);
}

function collectServiceHints(artifact) {
  const hints = collectHintsFromText(artifact, SERVICE_PATTERN);
  if (typeof artifact.parsed?.service === 'string') hints.push(artifact.parsed.service);
  return hints;
}

function collectOwnerHints(artifact) {
  const hints = collectHintsFromText(artifact, OWNER_PATTERN);
  if (typeof artifact.parsed?.owner === 'string') hints.push(artifact.parsed.owner);
  return hints;
}

function collectSignatures(artifact) {
  const signatures = [];

  if (typeof artifact.excerpt === 'string') {
    for (const line of artifact.excerpt.split(/\r?\n/)) {
      const match = line.match(TYPE_ERROR_PATTERN);
      if (match) {
        signatures.push(toSignature(match[1]));
      }
    }
  }

  return signatures;
}

export function analyzeCapsule(capsule) {
  const timeline = [];
  const signatureCounts = new Map();
  const serviceHints = [];
  const ownerHints = [];

  for (const artifact of capsule.artifacts) {
    timeline.push(...parseTimelineFromText(artifact));
    timeline.push(...parseTimelineFromJson(artifact));
    serviceHints.push(...collectServiceHints(artifact));
    ownerHints.push(...collectOwnerHints(artifact));

    for (const signature of collectSignatures(artifact)) {
      signatureCounts.set(signature, (signatureCounts.get(signature) ?? 0) + 1);
    }
  }

  return {
    timeline: timeline.sort((left, right) => left.timestamp.localeCompare(right.timestamp)),
    signatures: [...signatureCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([signature, count]) => ({ signature, count }))
      .sort((left, right) => right.count - left.count || left.signature.localeCompare(right.signature)),
    serviceHints: uniqueSorted(serviceHints),
    ownerHints: uniqueSorted(ownerHints),
  };
}
