import csv from 'csv-parser';
import { Readable } from 'stream';
import * as fs from 'fs';

export interface CsvRow {
  [key: string]: string;
}

export function parseCsv(filePath: string): Promise<CsvRow[]> {
  return new Promise((resolve, reject) => {
    const results: CsvRow[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

export function generateCsv(headers: string[], rows: string[][]): string {
  const csvRows = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))];
  return csvRows.join('\n');
}
