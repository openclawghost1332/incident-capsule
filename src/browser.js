function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function renderList(items, emptyLabel, mapper) {
  if (!items.length) {
    return `<li>${escapeHtml(emptyLabel)}</li>`;
  }

  return items.map(mapper).join('');
}

export function renderBrowserReport(report) {
  return `
    <section class="hero">
      <h1>Incident Capsule</h1>
      <p class="lede">Deterministic incident evidence capsule for ${escapeHtml(report.analysis.serviceHints.join(', ') || 'unknown services')}.</p>
      <div class="summary-grid">
        <article><h2>Artifacts</h2><p>${report.summary.artifactCount}</p></article>
        <article><h2>Processed</h2><p>${report.summary.processedCount}</p></article>
        <article><h2>Ignored</h2><p>${report.summary.ignoredCount}</p></article>
        <article><h2>Warnings</h2><p>${report.summary.warningCount}</p></article>
      </div>
    </section>
    <section>
      <h2>Repeated signatures</h2>
      <ul>
        ${renderList(report.analysis.signatures, 'No repeated signatures detected.', (item) => `<li><strong>${escapeHtml(item.signature)}</strong> <span>x${item.count}</span></li>`)}
      </ul>
    </section>
    <section>
      <h2>Timeline</h2>
      <ul>
        ${renderList(report.analysis.timeline, 'No timeline events detected.', (event) => `<li><strong>${escapeHtml(event.timestamp)}</strong> ${escapeHtml(event.summary)} <span class="muted">${escapeHtml(event.source)}</span></li>`)}
      </ul>
    </section>
    <section>
      <h2>Artifacts</h2>
      <ul>
        ${renderList(report.artifacts, 'No artifacts collected.', (artifact) => `<li><strong>${escapeHtml(artifact.relativePath)}</strong> ${escapeHtml(artifact.kind)}${artifact.warnings.length ? ` <span class="warning">${escapeHtml(artifact.warnings.join('; '))}</span>` : ''}</li>`)}
      </ul>
    </section>
  `;
}

export function mountBrowserReport({ report, document = globalThis.document, target = document?.querySelector('[data-report-root]') } = {}) {
  if (!target) {
    throw new Error('Browser report target not found.');
  }

  target.innerHTML = renderBrowserReport(report);
}
