import { resolveAllowOrigin } from "../cors";

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

function downloadHeaders(
  filename: string,
  contentType: string,
  corsOrigin: string,
  requestOrigin: string | null,
): Record<string, string> {
  const allowOrigin = resolveAllowOrigin(corsOrigin, requestOrigin);
  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Access-Control-Expose-Headers": "Content-Disposition",
    Vary: "Origin",
  };
  if (allowOrigin) {
    headers["Access-Control-Allow-Origin"] = allowOrigin;
  }
  return headers;
}

export function csvDownloadResponse(
  filename: string,
  content: string,
  corsOrigin: string,
  requestOrigin: string | null,
): Response {
  return new Response(content, {
    status: 200,
    headers: downloadHeaders(
      filename,
      "text/csv; charset=utf-8",
      corsOrigin,
      requestOrigin,
    ),
  });
}

export function zipDownloadResponse(
  filename: string,
  content: Uint8Array,
  corsOrigin: string,
  requestOrigin: string | null,
): Response {
  return new Response(content, {
    status: 200,
    headers: downloadHeaders(
      filename,
      "application/zip",
      corsOrigin,
      requestOrigin,
    ),
  });
}

export function exportFilename(prefix: string, extension = "csv"): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}-${date}.${extension}`;
}
