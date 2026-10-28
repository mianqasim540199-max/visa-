import {
  INITIAL_CUSTOMERS,
  INITIAL_CUSTOMER_TRANSACTIONS,
  INITIAL_AGENT_ASSIGNMENTS,
  INITIAL_AGENT_PAYMENTS,
} from '../src/utils/initialData';
import { generateExcelWorkbook } from '../src/utils/excelExport';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const wb = generateExcelWorkbook(
  INITIAL_CUSTOMERS,
  INITIAL_CUSTOMER_TRANSACTIONS,
  INITIAL_AGENT_ASSIGNMENTS,
  INITIAL_AGENT_PAYMENTS,
  'CUST-0001'
);

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const outputPath = path.resolve(publicDir, 'Customer_Agent_Management_System.xlsx');
XLSX.writeFile(wb, outputPath);
console.log('Successfully generated Excel workbook at:', outputPath);
