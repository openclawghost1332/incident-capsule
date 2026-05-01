import { fetchSampleReport } from './sample-report.js';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderList(items, renderItem) {
  if (!items.length) {
    return '<li>none</li>';
  }

  return items.map(renderItem).join('');
}

export function renderBrowserReport(report) {
  const signatures = renderList(
    report.analysis.signatures,
    (item) => `<li><code>${escapeHtml(item.signature)}</code> <span class="pill">${item.count}x</span></li>`
  );
  const timeline = renderList(
    report.analysis.timeline,
    (event) => `<li><strong>${escapeHtml(event.timestamp)}</strong> ${escapeHtml(event.summary)} <span class="muted">(${escapeHtml(event.source)})</span></li>`
  );
  const artifacts = renderList(
    report.artifacts,
    (artifact) => `<li><code>${escapeHtml(artifact.relativePath)}</code> <span class="muted">${escapeHtml(artifact.kind)}</span></li>`
  );
  const warnings = renderList(
    report.artifacts.filter((artifact) => Array.isArray(artifact.warnings) && artifact.warnings.length > 0),
    (artifact) => `<li><code>${escapeHtml(artifact.relativePath)}</code> ${escapeHtml(artifact.warnings.join('; '))}</li>`
  );

  return `
    <section class="hero">
      <p class="eyebrow">Deterministic incident capsule</p>
      <h1>Incident Capsule</h1>
      <p class="lede">Portable mixed-artifact incident summary with the same report contract for CLI and browser views.</p>
    </section>

    <section class="grid stats">
      <article class="card"><h2>${report.summary.artifactCount}</h2><p>artifacts</p></article>
      <article class="card"><h2>${report.summary.processedCount}</h2><p>processed</p></article>
      <article class="card"><h2>${report.summary.ignoredCount}</h2><p>ignored</p></article>
      <article class="card"><h2>${report.summary.warningCount}</h2><p>warnings</p></article>
    </section>

    <section class="grid two-up">
      <article class="card">
        <h2>Service hints</h2>
        <p>${escapeHtml(report.analysis.serviceHints.join(', ') || 'none')}</p>
        <h3>Owner hints</h3>
        <p>${escapeHtml(report.analysis.ownerHints.join(', ') || 'none')}</p>
      </article>
      <article class="card">
        <h2>Top repeated signatures</h2>
        <ul>${signatures}</ul>
      </article>
    </section>

    <section class="grid two-up">
      <article class="card">
        <h2>Timeline</h2>
        <ul>${timeline}</ul>
      </article>
      <article class="card">
        <h2>Warnings</h2>
        <ul>${warnings}</ul>
      </article>
    </section>

    <section class="card">
      <h2>Artifacts</h2>
      <ul>${artifacts}</ul>
    </section>
  `;
}

export function renderBrowserShell(report) {
  return `<main class="page">${renderBrowserReport(report)}</main>`;
}

export async function bootstrapBrowserReport() {
  const mount = document.querySelector('[data-report-root]');

  if (!mount) {
    return;
  }

  try {
    const report = await fetchSampleReport();
    mount.innerHTML = renderBrowserShell(report);
  } catch (error) {
    mount.innerHTML = `<main class="page"><section class="card error"><h1>Incident Capsule</h1><p>${escapeHtml(error.message)}</p></section></main>`;
  }
}

if (typeof document !== 'undefined') {
  bootstrapBrowserReport();
}
