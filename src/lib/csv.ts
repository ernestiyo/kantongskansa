function escapeCsvField(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCsvRow(fields: (string | number)[]): string {
  return fields.map(escapeCsvField).join(",");
}

export function toCsvDocument(rows: (string | number)[][]): string {
  return rows.map(toCsvRow).join("\r\n");
}
