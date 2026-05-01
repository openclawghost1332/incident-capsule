import { mountBrowserReport } from './browser.js';

export async function loadSampleReport(url = './sample/report.json') {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load sample report: ${response.status}`);
  }

  return response.json();
}

export async function bootSampleReport({ url = './sample/report.json', document = globalThis.document } = {}) {
  const report = await loadSampleReport(url);
  mountBrowserReport({ report, document });
  return report;
}
