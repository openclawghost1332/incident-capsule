export const sampleReportUrl = new URL('../sample/report.json', import.meta.url);

export async function fetchSampleReport() {
  const response = await fetch(sampleReportUrl);

  if (!response.ok) {
    throw new Error(`Unable to load sample report: ${response.status}`);
  }

  return response.json();
}
