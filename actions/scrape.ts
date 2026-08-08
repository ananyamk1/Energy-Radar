/**
 * Fetch ERCOT's GIS interconnection queue report and save as JSON.
 *
 * Setup:
 *   npm install cheerio xlsx
 *
 * Run:
 *   npx tsx fetch-ercot-gis.ts
 *   (or compile with tsc and run with node)
 *
 * No API key or auth required — this hits ERCOT's public legacy
 * MIS report system, not the newer authenticated Public API.
 *
 * Output:
 *   ercot_gis_report.json — array of project records.
 *
 * Schedule this monthly (the underlying report only updates monthly).
 */

import * as cheerio from 'cheerio';
import * as XLSX from 'xlsx';
import { writeFileSync } from 'fs';

// mis.ercot.com was decommissioned — ERCOT moved this to www.ercot.com.
// See: https://www.ercot.com/services/comm/mkt_notices/M-D090922-02
const REPORT_LIST_URL =
  'https://www.ercot.com/misapp/GetReports.do?reportTypeId=15933&reportTitle=GIS+Report&showHTMLView=&mimicKey=';

interface ReportLink {
  label: string;
  url: string;
}

async function getLatestReportUrl(): Promise<ReportLink> {
  const res = await fetch(REPORT_LIST_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch report list: ${res.status} ${res.statusText}`);
  }
  const html = await res.text();
  const $ = cheerio.load(html);

  // The report list page renders a table of postings, each with a
  // download link. Structure may shift — inspect the raw HTML on
  // first run (see logStructure below) and adjust this selector.
  const links: ReportLink[] = [];
  $('a').each((_, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();
    if (href && (href.includes('.xlsx') || href.toLowerCase().includes('doclookupid'))) {
      links.push({
        label: text,
        url: href.startsWith('http') ? href : `https://www.ercot.com${href}`,
      });
    }
  });

  if (links.length === 0) {
    console.log('--- No file links found. Raw HTML snippet for debugging: ---');
    console.log(html.slice(0, 2000));
    throw new Error('No report links found — inspect the HTML structure above and adjust the selector.');
  }

  // Reports are typically listed most-recent-first
  return links[0];
}

async function downloadAndParse(reportUrl: string): Promise<Record<string, unknown>[]> {
  const res = await fetch(reportUrl);
  if (!res.ok) {
    throw new Error(`Failed to download report file: ${res.status} ${res.statusText}`);
  }
  const buffer = await res.arrayBuffer();

  const workbook = XLSX.read(buffer, { type: 'array' });
  console.log('Sheet names:', workbook.SheetNames);

  // GIS Report typically has multiple sheets: Large Gen, Small Gen,
  // Inactive, Cancelled. Adjust which sheet(s) you pull based on
  // what get printed above.
  const sheetName = workbook.SheetNames.find((n) => /large\s*gen/i.test(n)) ?? workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  console.log(`Parsed ${rows.length} rows from sheet "${sheetName}"`);
  if (rows.length > 0) {
    console.log('Sample row keys:', Object.keys(rows[0]));
  }

  return rows;
}

// lib/ingestion/ercot-gis.ts
//
// Sanitizes raw ERCOT GIM report JSON (xlsx-to-JSON dump with __EMPTY_N
// column names, Excel serial dates, and junk title/notes/header rows
// mixed into the data array) into a typed, readable array of projects.

export interface RawErcotReport {
  fetched_at?: string;
  source?: string;
  count?: number;
  projects: Record<string, unknown>[];
}

export interface ErcotProject {
  inr: string;
  project_name: string | null;
  gim_study_phase: string | null;
  interconnecting_entity: string | null;
  poi_location: string | null;
  county: string | null;
  cdr_reporting_zone: string | null;
  projected_cod: string | null; // ISO date
  fuel: string | null;
  technology: string | null;
  capacity_mw: number | null;
  change_indicator: string | null;
  site_control_approval_date: string | null;
  screening_study_started: string | null;
  screening_study_complete: string | null;
  fis_requested: string | null;
  fis_approved: string | null;
  economic_study_required: string | null;
  ia_signed: string | null;
  financial_security_ntp: string | null;
  air_permit: string | null;
  ghg_permit: string | null;
  water_availability: string | null;
  meets_planning_guide: string | null;
  meets_all_planning_guide: string | null;
  qsa_prerequisites: string | null;
  construction_start: string | null;
  construction_end: string | null;
  approved_for_energization: string | null;
  approved_for_synchronization: string | null;
  comment: string | null;
}

const FIELD_MAP: Record<string, keyof ErcotProject> = {
  __EMPTY: "inr",
  __EMPTY_1: "project_name",
  __EMPTY_2: "gim_study_phase",
  __EMPTY_3: "interconnecting_entity",
  __EMPTY_4: "poi_location",
  __EMPTY_5: "county",
  __EMPTY_6: "cdr_reporting_zone",
  __EMPTY_7: "projected_cod",
  __EMPTY_8: "fuel",
  __EMPTY_9: "technology",
  __EMPTY_10: "capacity_mw",
  __EMPTY_11: "change_indicator",
  __EMPTY_12: "site_control_approval_date",
  __EMPTY_13: "screening_study_started",
  __EMPTY_14: "screening_study_complete",
  __EMPTY_15: "fis_requested",
  __EMPTY_16: "fis_approved",
  __EMPTY_17: "economic_study_required",
  __EMPTY_18: "ia_signed",
  __EMPTY_19: "financial_security_ntp",
  __EMPTY_20: "air_permit",
  __EMPTY_21: "ghg_permit",
  __EMPTY_22: "water_availability",
  __EMPTY_23: "meets_planning_guide",
  __EMPTY_24: "meets_all_planning_guide",
  __EMPTY_25: "qsa_prerequisites",
  __EMPTY_26: "construction_start",
  __EMPTY_27: "construction_end",
  __EMPTY_28: "approved_for_energization",
  __EMPTY_29: "approved_for_synchronization",
  __EMPTY_30: "comment",
};

const DATE_FIELDS = new Set<keyof ErcotProject>([
  "projected_cod",
  "site_control_approval_date",
  "screening_study_started",
  "screening_study_complete",
  "fis_requested",
  "fis_approved",
  "ia_signed",
  "meets_planning_guide",
  "meets_all_planning_guide",
  "qsa_prerequisites",
  "construction_start",
  "construction_end",
  "approved_for_energization",
  "approved_for_synchronization",
]);

// Excel's day-0 epoch, adjusted for the 1900 leap-year bug (standard formula).
const EXCEL_EPOCH_MS = Date.UTC(1899, 11, 30);
const MS_PER_DAY = 86400 * 1000;

function excelSerialToIso(value: unknown): string | null {
  if (value === null || value === undefined || value === "" || value === 0 || value === 1) {
    // 1 = the "1-1-1900" sentinel ERCOT uses to mean "no date available"
    return null;
  }
  const serial = Number(value);
  if (Number.isNaN(serial)) return null;
  const date = new Date(EXCEL_EPOCH_MS + serial * MS_PER_DAY);
  return date.toISOString().slice(0, 10);
}

function cleanString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/\r\n|\n/g, " ").trim();
  return cleaned || null;
}

const INR_PATTERN = /^\d+INR\d+/;

function isDataRow(row: Record<string, unknown>): boolean {
  const inr = row["__EMPTY"];
  // Real rows have an id like "15INR0064b"; notes/title/header rows don't match this shape.
  return typeof inr === "string" && INR_PATTERN.test(inr.trim());
}

export function sanitizeErcotGisReport(raw: RawErcotReport): ErcotProject[] {
  const clean: ErcotProject[] = [];

  for (const row of raw.projects) {
    if (!isDataRow(row)) continue;

    const project = {} as ErcotProject;
    for (const [rawKey, cleanKey] of Object.entries(FIELD_MAP)) {
      const value = row[rawKey];
      if (DATE_FIELDS.has(cleanKey)) {
        (project[cleanKey] as string | null) = excelSerialToIso(value);
      } else if (cleanKey === "capacity_mw") {
        project.capacity_mw = typeof value === "number" ? value : null;
      } else {
        (project[cleanKey] as string | null) = cleanString(value);
      }
    }
    clean.push(project);
  }

  return clean;
}


export async function fetchProjects(): Promise<ErcotProject[]> {
  console.log('Fetching report list...');
  const latest = await getLatestReportUrl();
  console.log(`Found latest report: ${latest.label} -> ${latest.url}`);

  console.log('Downloading and parsing xlsx...');
  const rows = await downloadAndParse(latest.url);

  const output = {
    fetched_at: new Date().toISOString(),
    source: 'ERCOT GIS Report (reportTypeId=15933)',
    report_label: latest.label,
    count: rows.length,
    projects: rows,
  };

  const parsedOutput = sanitizeErcotGisReport(output);

  return parsedOutput;
}
