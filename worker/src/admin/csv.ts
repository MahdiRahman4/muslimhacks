export function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export function formatCsvTimestamp(ms: number | null | undefined): string {
  if (ms == null) {
    return "";
  }

  return new Date(ms).toISOString();
}

export function formatCsvBoolean(value: boolean | number | null | undefined): string {
  if (value === true || value === 1) {
    return "yes";
  }
  return "no";
}

export function buildCsv(headers: string[], rows: unknown[][]): string {
  const lines = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ];
  return `${lines.join("\n")}\n`;
}

export function csvDownloadResponse(
  filename: string,
  content: string,
  corsOrigin: string,
  requestOrigin: string | null,
): Response {
  const allowOrigin =
    corsOrigin === "*" || (requestOrigin && requestOrigin === corsOrigin)
      ? requestOrigin ?? corsOrigin
      : corsOrigin;

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Expose-Headers": "Content-Disposition",
    },
  });
}

export function exportFilename(prefix: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}-${date}.csv`;
}
