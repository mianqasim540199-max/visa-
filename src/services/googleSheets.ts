import {
  Customer,
  CustomerPaymentTransaction,
  AgentAssignment,
  AgentPaymentTransaction,
} from '../types';
import { calculateCustomerFinancials, calculateOverallBusinessMetrics } from '../utils/calculations';

export interface CreateGoogleSheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export async function createGoogleSheetsSpreadsheet(
  accessToken: string,
  customers: Customer[],
  customerTransactions: CustomerPaymentTransaction[],
  agentAssignments: AgentAssignment[],
  agentTransactions: AgentPaymentTransaction[],
  selectedCustomerId?: string
): Promise<CreateGoogleSheetResult> {
  // 1. Create Spreadsheet with 3 worksheets in Google Sheets API v4
  const createPayload = {
    properties: {
      title: 'Customer & Agent Management System — Visa, Immigration & Travel Processing',
    },
    sheets: [
      {
        properties: {
          title: 'FINAL REPORT DASHBOARD',
          gridProperties: { rowCount: 100, columnCount: 15 },
        },
      },
      {
        properties: {
          title: 'CUSTOMER REGISTER',
          gridProperties: { rowCount: 500, columnCount: 36 },
        },
      },
      {
        properties: {
          title: 'AGENT REGISTER',
          gridProperties: { rowCount: 500, columnCount: 30 },
        },
      },
    ],
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createPayload),
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to create Google Sheet: ${createRes.statusText}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Prepare data for all 3 worksheets
  const targetCust =
    customers.find((c) => c.id === selectedCustomerId) || customers[0] || ({} as Customer);
  const fin = targetCust.id
    ? calculateCustomerFinancials(targetCust, customerTransactions, agentTransactions, agentAssignments)
    : null;
  const metrics = calculateOverallBusinessMetrics(
    customers,
    customerTransactions,
    agentTransactions,
    agentAssignments
  );

  // DASHBOARD VALUES
  const dashboardValues: (string | number)[][] = [
    ['CUSTOMER & AGENT MANAGEMENT SYSTEM — FINAL REPORT DASHBOARD'],
    ['Visa, Immigration, Medical, Biometrics, Protector, Ticketing & Document Processing'],
    [''],
    ['1. CUSTOMER SELECTION & PROFILE'],
    ['Selected Customer ID:', targetCust.id || 'N/A', 'Customer Full Name:', targetCust.fullName || 'N/A'],
    ['Phone Number:', targetCust.phone || 'N/A', 'WhatsApp Number:', targetCust.whatsapp || 'N/A'],
    ['Email Address:', targetCust.email || 'N/A', 'City / Location:', targetCust.city || 'N/A'],
    ['Service Category:', targetCust.serviceCategory || 'N/A', 'Destination Country:', targetCust.destinationCountry || 'N/A'],
    ['Assigned Agent:', targetCust.assignedAgent || 'N/A', 'Registration Date:', targetCust.registrationDate || 'N/A'],
    ['Current Case Status:', targetCust.caseStatus || 'N/A', 'Next Follow-up Date:', targetCust.nextFollowUpDate || 'N/A'],
    ['Notes / Instructions:', targetCust.notes || 'None'],
    [''],
    ['2. FINANCIAL SUMMARY (Selected Customer)'],
    ['Financial Metric', 'Amount (PKR)', 'Accounting Rule / Definition', 'Status / Verification'],
    ['Agreed Customer Fee', fin?.agreedFee || 0, 'Haath se tay shuda agreed fee', 'Agreed Target'],
    ['Total Customer Receipts', fin?.totalReceipts || 0, 'Asal mila: SUMIFS from Customer Receipts ledger', 'Actual Cash Inflow'],
    ['Total Customer Refunds', fin?.totalRefunds || 0, 'Wapas ki gayi rakam (Refunds ledger)', 'Deduction'],
    ['Net Customer Payments', fin?.netPayments || 0, 'Receipts − Refunds (Actual Cash Net)', 'Confirmed Net Received'],
    ['Customer Outstanding Balance', fin?.outstandingBalance || 0, 'MAX(0, Agreed Fee − Net Payments)', fin?.isOverpaid ? 'OVERPAID WARNING' : 'Pending from Client'],
    ['Agreed Agent Cost', fin?.agreedAgentCost || 0, 'Agent ka tay shuda cost', 'Agreed Cost'],
    ['Total Paid to Agent', fin?.totalPaidToAgent || 0, 'Authoritative: Sum from AGENT REGISTER ledger', 'Actual Cash Paid'],
    ['Remaining Agent Balance', fin?.remainingAgentBalance || 0, 'MAX(0, Agreed Agent Cost − Total Paid to Agent)', 'Pending to Agent'],
    ['Business Expenses', fin?.businessExpenses || 0, 'Direct expenses on customer', 'Actual Expense'],
    ['Estimated Commission / Profit', fin?.estimatedCommission || 0, 'Net Payments − Paid to Agent − Business Expenses (Cash Basis)', 'Estimated Cash Margin'],
    ['Expected Profit (Full Settlement)', fin?.expectedProfit || 0, 'Agreed Fee − Agreed Agent Cost − Business Expenses', 'Expected Total Profit'],
    [''],
    ['3. OVERALL BUSINESS KPI METRICS'],
    ['Metric Name', 'Value (PKR / Count)', 'Metric Category', 'Explanation'],
    ['Total Registered Customers', metrics.totalRegisteredCustomers, 'Count', 'Total customer records in database'],
    ['Total Active Cases', metrics.totalActiveCases, 'Operational Count', 'Cases in active processing'],
    ['Total Completed Cases', metrics.totalCompletedCases, 'Success Count', 'Approved or completed cases'],
    ['Total Pending Cases', metrics.totalPendingCases, 'Action Count', 'Cases awaiting docs or payment'],
    ['Total Agreed Customer Fees', metrics.totalAgreedFees, 'Contracted Revenue (PKR)', 'Sum of all customer agreed fees'],
    ['Total Customer Receipts (Net)', metrics.totalNetReceipts, 'Net Collected Revenue (PKR)', 'Net receipts collected to date'],
    ['Total Customer Outstanding Balances', metrics.totalOutstandingBalances, 'Total Kitna Lena Hai (PKR)', 'Kul baqi receivable balance'],
    ['Total Paid to Agents', metrics.totalPaidToAgents, 'Agent Payments (PKR)', 'Authoritative total paid to agents'],
    ['Total Remaining Agent Balances', metrics.totalRemainingAgentBalances, 'Agent Payables (PKR)', 'Outstanding owed to agents'],
    ['Total Business Expenses', metrics.totalBusinessExpenses, 'Operating Expenses (PKR)', 'Direct customer expenses'],
    ['Estimated Overall Profit (Cash Basis)', metrics.estimatedOverallProfit, 'Net Cash Margin (PKR)', 'Net Receipts − Agent Paid − Business Expenses'],
    [''],
    ['4. OPERATING RULES & INSTRUCTIONS'],
    ['Step 1', 'Naya Customer', 'CUSTOMER REGISTER mein row darj karein; ID automatic banegi.'],
    ['Step 2', 'Customer Payment', 'Payment Ledger mein date, Customer ID, type "Customer Receipt", amount likhein.'],
    ['Step 3', 'Agent Payment', 'AGENT REGISTER ke payment ledger mein darj karein taake double-counting na ho.'],
    ['Step 4', 'Case Status', 'CUSTOMER REGISTER ke column U ka dropdown badlein aur Next Follow-up update karein.'],
    ['Step 5', 'Final Report', 'FINAL REPORT DASHBOARD par Customer ID select karein, baqi sab khud calculate hoga.'],
  ];

  // CUSTOMER REGISTER VALUES
  const customerHeaders = [
    'Customer ID', 'Registration Date', 'Customer Full Name', 'Phone Number', 'WhatsApp Number',
    'Email Address', 'City', 'Full Address', 'Passport Number', 'Service Category',
    'Country / Destination', 'Assigned Agent', 'Agreed Customer Fee', 'Total Amount Received',
    'Customer Outstanding Balance', 'Total Amount Paid to Agent', 'Business Expenses',
    'Estimated Commission', 'Documents Received Status', 'Documents Sent to Agent Status',
    'Case Status', 'Next Follow-up Date', 'Last Updated', 'Notes', '',
    'Tx Date', 'Customer ID', 'Customer Name', 'Transaction Type', 'Amount (PKR)',
    'Payment Method', 'Receipt / Ref Number', 'Service Line', 'Notes', 'Check / Warning',
  ];

  const customerRows: (string | number)[][] = [
    ['CUSTOMER REGISTER & INTEGRATED PAYMENT LEDGER'],
    ['Columns A-X: Customer Database | Columns Z-AI: Customer Payment Ledger'],
    customerHeaders,
  ];

  const maxCustRows = Math.max(customers.length, customerTransactions.length);
  for (let i = 0; i < maxCustRows; i++) {
    const cust = customers[i];
    const tx = customerTransactions[i];

    let custCols: (string | number)[] = Array(24).fill('');
    if (cust) {
      const cFin = calculateCustomerFinancials(cust, customerTransactions, agentTransactions, agentAssignments);
      custCols = [
        cust.id, cust.registrationDate, cust.fullName, cust.phone, cust.whatsapp,
        cust.email, cust.city, cust.fullAddress, cust.passportNumber || '', cust.serviceCategory,
        cust.destinationCountry, cust.assignedAgent, cFin.agreedFee, cFin.totalReceipts,
        cFin.outstandingBalance, cFin.totalPaidToAgent, cFin.businessExpenses, cFin.estimatedCommission,
        cust.documentsReceived, cust.documentsSentToAgent, cust.caseStatus, cust.nextFollowUpDate,
        cust.lastUpdated, cust.notes,
      ];
    }

    let txCols: (string | number)[] = Array(10).fill('');
    if (tx) {
      const warning =
        tx.transactionType === 'Payment to Agent'
          ? 'CHECK: Agent payment AGENT REGISTER mein likhein'
          : !tx.amount || tx.amount <= 0
          ? 'CHECK: Amount missing'
          : 'OK';

      txCols = [
        tx.transactionDate, tx.customerId, tx.customerName, tx.transactionType,
        tx.amount, tx.paymentMethod, tx.referenceNumber, tx.serviceLine || '',
        tx.notes, warning,
      ];
    }

    customerRows.push([...custCols, '', ...txCols]);
  }

  // AGENT REGISTER VALUES
  const agentHeaders = [
    'Agent ID', 'Agent / Company Name', 'Phone Number', 'WhatsApp Number', 'Email',
    'City / Address', 'Customer ID', 'Customer Name', 'Service Category', 'Agreed Agent Cost',
    'Total Paid to Agent', 'Remaining Agent Balance', 'Last Payment Date', 'Payment Method',
    'Receipt / Reference Number', 'Documents Sent', 'Documents Received / Returned',
    'Agent Work Status', 'Expected Completion Date', 'Notes', '',
    'Payment Date', 'Agent ID', 'Customer ID', 'Payment Purpose / Maqsad', 'Amount (PKR)', 'Payment Method',
    'Receipt / Ref Number', 'Notes', 'Check / Warning',
  ];

  const agentRows: (string | number)[][] = [
    ['AGENT REGISTER & AUTHORITATIVE AGENT PAYMENT LEDGER'],
    ['Columns A-T: Agent Assignments | Columns V-AC: Agent Payment Ledger'],
    agentHeaders,
  ];

  const maxAgentRows = Math.max(agentAssignments.length, agentTransactions.length);
  for (let i = 0; i < maxAgentRows; i++) {
    const asgn = agentAssignments[i];
    const atx = agentTransactions[i];

    let asgnCols: (string | number)[] = Array(20).fill('');
    if (asgn) {
      const paidToThisAgentForCust = agentTransactions
        .filter((t) => t.agentId === asgn.agentId && t.customerId === asgn.customerId)
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const remaining = Math.max(0, (Number(asgn.agreedAgentCost) || 0) - paidToThisAgentForCust);

      const relevantTxs = agentTransactions.filter(
        (t) => t.agentId === asgn.agentId && t.customerId === asgn.customerId
      );
      const lastTx = relevantTxs[relevantTxs.length - 1];

      asgnCols = [
        asgn.agentId, asgn.agentName, asgn.phone, asgn.whatsapp, asgn.email,
        asgn.cityAddress, asgn.customerId, asgn.customerName, asgn.serviceCategory,
        asgn.agreedAgentCost, paidToThisAgentForCust, remaining,
        lastTx ? lastTx.paymentDate : '', lastTx ? lastTx.paymentMethod : '',
        lastTx ? lastTx.referenceNumber : '', asgn.documentsSent, asgn.documentsReceived,
        asgn.agentWorkStatus, asgn.expectedCompletionDate, asgn.notes,
      ];
    }

    let atxCols: (string | number)[] = Array(9).fill('');
    if (atx) {
      const isAssigned = agentAssignments.some(
        (a) => a.agentId === atx.agentId && a.customerId === atx.customerId
      );
      const warning = !isAssigned
        ? 'CHECK: Is agent ko ye customer assign nahi'
        : !atx.amount || atx.amount <= 0
        ? 'CHECK: Amount missing'
        : 'OK';

      atxCols = [
        atx.paymentDate, atx.agentId, atx.customerId, atx.purpose || '', atx.amount,
        atx.paymentMethod, atx.referenceNumber, atx.notes, warning,
      ];
    }

    agentRows.push([...asgnCols, '', ...atxCols]);
  }

  // 3. Batch Update all sheets
  const updatePayload = {
    valueInputOption: 'USER_ENTERED',
    data: [
      {
        range: "'FINAL REPORT DASHBOARD'!A1",
        values: dashboardValues,
      },
      {
        range: "'CUSTOMER REGISTER'!A1",
        values: customerRows,
      },
      {
        range: "'AGENT REGISTER'!A1",
        values: agentRows,
      },
    ],
  };

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    }
  );

  if (!updateRes.ok) {
    const errData = await updateRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to populate values: ${updateRes.statusText}`);
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
  };
}
