import * as XLSX from 'xlsx';
import { Lead } from '@/types/crm';

export interface ParsedExcelResult {
  headers: string[];
  rows: Record<string, any>[];
  sheetName: string;
}

/**
 * Generates and downloads a sample Excel template for Red Hill Infra ad lead intake
 */
export function downloadSampleLeadTemplate(): void {
  const sampleData = [
    {
      'Full Name': 'Siddharth Varma',
      'Phone Number': '+91 98450 77112',
      'Email Address': 'siddharth.varma@adclick.in',
      'Lead Source': 'Meta Ads (Instagram)',
      'Campaign Name': 'Meta_HSR_Luxury_Apts_Q1',
      'Project': 'Red Hill Heights (HSR)',
      'Budget': '1.5 Cr - 2.5 Cr',
      'Status': 'New',
      'Notes': 'Inquired about 3BHK East-facing unit with two car parkings',
      'Inquiry Date': new Date().toISOString().split('T')[0],
    },
    {
      'Full Name': 'Divya Sundaram',
      'Phone Number': '+91 97411 22334',
      'Email Address': 'divya.s@healthtech.io',
      'Lead Source': 'Google Ads (Search)',
      'Campaign Name': 'Google_Search_Villas_Sarjapur',
      'Project': 'Red Hill Meadows (Sarjapur-HSR)',
      'Budget': '1 Cr - 1.5 Cr',
      'Status': 'Contacted',
      'Notes': 'Needs villa plot for immediate construction, prefers Sarjapur road side',
      'Inquiry Date': new Date(Date.now() - 86400000).toISOString().split('T')[0],
    },
    {
      'Full Name': 'Manish Kothari',
      'Phone Number': '+91 99003 44556',
      'Email Address': 'm.kothari@textilecorp.com',
      'Lead Source': 'MagicBricks',
      'Campaign Name': 'MagicBricks_HSR_Premium',
      'Project': 'Red Hill Heights (HSR)',
      'Budget': '2.5 Cr+',
      'Status': 'Interested',
      'Notes': 'Looking for 4BHK duplex penthouse with private terrace in HSR Sector 1',
      'Inquiry Date': new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    },
    {
      'Full Name': 'Archana Pillai',
      'Phone Number': '+91 96118 99001',
      'Email Address': 'archana.pillai@globalbank.com',
      'Lead Source': 'WhatsApp Ads',
      'Campaign Name': 'WhatsApp_Weekend_OpenHouse',
      'Project': 'Red Hill Serenity',
      'Budget': '1.5 Cr - 2.5 Cr',
      'Status': 'Site Visit Scheduled',
      'Notes': 'Site visit confirmed for upcoming Sunday 11 AM with family',
      'Inquiry Date': new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    },
    {
      'Full Name': 'Kunal Singhania',
      'Phone Number': '+91 95350 66778',
      'Email Address': 'kunal.s@retailgroup.in',
      'Lead Source': 'Housing.com',
      'Campaign Name': 'Housing_Exclusive_Promos',
      'Project': 'Red Hill Commercial ORR',
      'Budget': '2.5 Cr+',
      'Status': 'New',
      'Notes': 'Commercial shop space inquiry for high-end boutique cafe',
      'Inquiry Date': new Date().toISOString().split('T')[0],
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 22 }, // Full Name
    { wch: 18 }, // Phone Number
    { wch: 28 }, // Email Address
    { wch: 22 }, // Lead Source
    { wch: 28 }, // Campaign Name
    { wch: 28 }, // Project
    { wch: 18 }, // Budget
    { wch: 18 }, // Status
    { wch: 45 }, // Notes
    { wch: 14 }, // Inquiry Date
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ad_Leads_Template');
  XLSX.writeFile(workbook, 'Red_Hill_Infra_Sample_Leads.xlsx');
}

/**
 * Generates and downloads a sample CSV template for lead intake
 */
export function downloadSampleLeadCSV(): void {
  const sampleData = [
    {
      'Full Name': 'Siddharth Varma',
      'Phone Number': '+91 98450 77112',
      'Email Address': 'siddharth.varma@adclick.in',
      'Lead Source': 'Meta Ads (Instagram)',
      'Campaign Name': 'Meta_HSR_Luxury_Apts_Q1',
      'Project': 'Red Hill Heights (HSR)',
      'Budget': '1.5 Cr - 2.5 Cr',
      'Status': 'New',
      'Notes': 'Inquired about 3BHK East-facing unit with two car parkings',
      'Inquiry Date': new Date().toISOString().split('T')[0],
    },
    {
      'Full Name': 'Divya Sundaram',
      'Phone Number': '+91 97411 22334',
      'Email Address': 'divya.s@healthtech.io',
      'Lead Source': 'Google Ads (Search)',
      'Campaign Name': 'Google_Search_Villas_Sarjapur',
      'Project': 'Red Hill Meadows (Sarjapur-HSR)',
      'Budget': '1 Cr - 1.5 Cr',
      'Status': 'Contacted',
      'Notes': 'Needs villa plot for immediate construction',
      'Inquiry Date': new Date(Date.now() - 86400000).toISOString().split('T')[0],
    },
    {
      'Full Name': 'Manish Kothari',
      'Phone Number': '+91 99003 44556',
      'Email Address': 'm.kothari@textilecorp.com',
      'Lead Source': 'MagicBricks',
      'Campaign Name': 'MagicBricks_HSR_Premium',
      'Project': 'Red Hill Heights (HSR)',
      'Budget': '2.5 Cr+',
      'Status': 'Interested',
      'Notes': 'Looking for 4BHK duplex penthouse with private terrace in HSR Sector 1',
      'Inquiry Date': new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    },
    {
      'Full Name': 'Archana Pillai',
      'Phone Number': '+91 96118 99001',
      'Email Address': 'archana.pillai@globalbank.com',
      'Lead Source': 'WhatsApp Ads',
      'Campaign Name': 'WhatsApp_Weekend_OpenHouse',
      'Project': 'Red Hill Serenity',
      'Budget': '1.5 Cr - 2.5 Cr',
      'Status': 'Site Visit Scheduled',
      'Notes': 'Site visit confirmed for upcoming Sunday 11 AM with family',
      'Inquiry Date': new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    },
    {
      'Full Name': 'Kunal Singhania',
      'Phone Number': '+91 95350 66778',
      'Email Address': 'kunal.s@retailgroup.in',
      'Lead Source': 'Housing.com',
      'Campaign Name': 'Housing_Exclusive_Promos',
      'Project': 'Red Hill Commercial ORR',
      'Budget': '2.5 Cr+',
      'Status': 'New',
      'Notes': 'Commercial shop space inquiry for high-end boutique cafe',
      'Inquiry Date': new Date().toISOString().split('T')[0],
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Red_Hill_Infra_Sample_Leads.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses an uploaded Excel / CSV file using SheetJS
 */
export async function parseExcelFile(file: File): Promise<ParsedExcelResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        let workbook;

        try {
          workbook = XLSX.read(data, { type: 'array', raw: false, cellDates: true });
        } catch {
          // If binary buffer reading failed on plain text CSV, decode as string
          const textDecoder = new TextDecoder('utf-8');
          const text = textDecoder.decode(data);
          workbook = XLSX.read(text, { type: 'string', raw: false });
        }

        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('File contains no sheets or data.');
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonRows.length === 0) {
          throw new Error('File is empty. Please ensure it has a header and data rows.');
        }

        const headers = Object.keys(jsonRows[0]);
        resolve({
          headers,
          rows: jsonRows,
          sheetName: firstSheetName,
        });
      } catch (err: any) {
        reject(new Error(err.message || 'Failed to parse file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('File reading failed.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Exports current CRM leads to CSV format
 */
export function exportLeadsToCSV(leads: Lead[], filename = 'RedHill_CRM_Leads_Export.csv'): void {
  const exportData = leads.map((l) => ({
    'Lead ID': l.id,
    'Client Name': l.name,
    'Phone Number': l.phone,
    'Email': l.email || '',
    'Lead Source': l.source,
    'Campaign': l.campaign_name || '',
    'Project Interested': l.project_interested,
    'Budget Range': l.budget,
    'Current Status': l.status.toUpperCase(),
    'Non-conversion Reason': l.non_conversion_reason || '',
    'Telecaller Notes': l.notes || '',
    'Created At': new Date(l.created_at).toISOString().split('T')[0],
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports current CRM leads to Excel
 */
export function exportLeadsToExcel(leads: Lead[], filename = 'RedHill_CRM_Leads_Export.xlsx'): void {
  const exportData = leads.map((l) => ({
    'Lead ID': l.id,
    'Client Name': l.name,
    'Phone Number': l.phone,
    'Email': l.email || '',
    'Lead Source': l.source,
    'Campaign': l.campaign_name || '',
    'Project Interested': l.project_interested,
    'Budget Range': l.budget,
    'Current Status': l.status.toUpperCase(),
    'Non-conversion Reason': l.non_conversion_reason || '',
    'Telecaller Notes': l.notes || '',
    'Created At': new Date(l.created_at).toLocaleDateString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
  XLSX.writeFile(workbook, filename);
}
