import {
  Customer,
  CustomerPaymentTransaction,
  AgentAssignment,
  AgentPaymentTransaction,
  CaseStatus,
} from '../types';

export interface CustomerFinancials {
  customerId: string;
  agreedFee: number;
  totalReceipts: number;
  totalRefunds: number;
  netPayments: number;
  outstandingBalance: number;
  isOverpaid: boolean;
  overpaidAmount: number;
  agreedAgentCost: number;
  totalPaidToAgent: number;
  remainingAgentBalance: number;
  businessExpenses: number;
  estimatedCommission: number; // Cash basis
  expectedProfit: number; // Accrual / fully-realized basis
}

export interface AgentAssignmentFinancials {
  agentId: string;
  agentName: string;
  customerId: string;
  customerName: string;
  serviceCategory: string;
  agreedCost: number;
  totalPaid: number;
  remainingBalance: number;
  isOverpaid: boolean;
  overpaidAmount: number;
  percentPaid: number;
  isActive: boolean;
  agentWorkStatus: string;
  expectedCompletionDate: string;
  documentsSent: string;
  documentsReceived: string;
  notes: string;
}

export function isAgentAssignmentActive(status: string): boolean {
  return !['Completed', 'Cancelled'].includes(status);
}

export function calculateAgentAssignmentFinancials(
  asgn: AgentAssignment,
  agentTransactions: AgentPaymentTransaction[]
): AgentAssignmentFinancials {
  const agreedCost = Number(asgn.agreedAgentCost) || 0;

  // Filter transactions matching this customer and this agent
  const relevantTxs = agentTransactions.filter(
    (tx) => tx.customerId === asgn.customerId && tx.agentId === asgn.agentId
  );

  // If a transaction specifies a serviceLine, match it to this assignment's serviceCategory.
  // If no serviceLine is set on a tx and there is only 1 assignment for this (customerId, agentId), count it.
  const totalPaid = relevantTxs
    .filter((tx) => !tx.serviceLine || tx.serviceLine === asgn.serviceCategory)
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const remainingBalance = Math.max(0, agreedCost - totalPaid);
  const isOverpaid = totalPaid > agreedCost;
  const overpaidAmount = isOverpaid ? totalPaid - agreedCost : 0;
  const percentPaid =
    agreedCost > 0 ? Math.min(100, Math.round((totalPaid / agreedCost) * 100)) : 0;
  const isActive = isAgentAssignmentActive(asgn.agentWorkStatus);

  return {
    agentId: asgn.agentId,
    agentName: asgn.agentName,
    customerId: asgn.customerId,
    customerName: asgn.customerName,
    serviceCategory: asgn.serviceCategory,
    agreedCost,
    totalPaid,
    remainingBalance,
    isOverpaid,
    overpaidAmount,
    percentPaid,
    isActive,
    agentWorkStatus: asgn.agentWorkStatus,
    expectedCompletionDate: asgn.expectedCompletionDate,
    documentsSent: asgn.documentsSent,
    documentsReceived: asgn.documentsReceived,
    notes: asgn.notes,
  };
}

export function calculateCustomerFinancials(
  customer: Customer,
  customerTransactions: CustomerPaymentTransaction[],
  agentTransactions: AgentPaymentTransaction[],
  agentAssignments: AgentAssignment[]
): CustomerFinancials {
  const custTx = customerTransactions.filter((tx) => tx.customerId === customer.id);
  
  const totalReceipts = custTx
    .filter((tx) => tx.transactionType === 'Customer Receipt')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const totalRefunds = custTx
    .filter((tx) => tx.transactionType === 'Refund to Customer')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const netPayments = totalReceipts - totalRefunds;

  const agreedFee = Number(customer.agreedFee) || 0;
  const outstandingBalance = Math.max(0, agreedFee - netPayments);
  const isOverpaid = netPayments > agreedFee;
  const overpaidAmount = isOverpaid ? netPayments - agreedFee : 0;

  // Authoritative agent source: Agent transactions for this customer
  const totalPaidToAgent = agentTransactions
    .filter((tx) => tx.customerId === customer.id)
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  // Agreed Agent Cost from assignments for this customer
  const agreedAgentCost = agentAssignments
    .filter((asgn) => asgn.customerId === customer.id)
    .reduce((sum, asgn) => sum + (Number(asgn.agreedAgentCost) || 0), 0);

  const remainingAgentBalance = Math.max(0, agreedAgentCost - totalPaidToAgent);

  // Business Expenses for this customer from ledger
  const businessExpenses = custTx
    .filter((tx) => tx.transactionType === 'Business Expense')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  // Estimated Commission / Profit (cash basis: Net Payments - Agent Paid - Expenses)
  const estimatedCommission = netPayments - totalPaidToAgent - businessExpenses;

  // Expected Profit (if fully settled: Agreed Fee - Agreed Agent Cost - Expenses)
  const expectedProfit = agreedFee - agreedAgentCost - businessExpenses;

  return {
    customerId: customer.id,
    agreedFee,
    totalReceipts,
    totalRefunds,
    netPayments,
    outstandingBalance,
    isOverpaid,
    overpaidAmount,
    agreedAgentCost,
    totalPaidToAgent,
    remainingAgentBalance,
    businessExpenses,
    estimatedCommission,
    expectedProfit,
  };
}

export interface BusinessMetrics {
  totalRegisteredCustomers: number;
  totalActiveCases: number;
  totalCompletedCases: number;
  totalPendingCases: number;
  totalAgreedFees: number;
  totalNetReceipts: number;
  totalOutstandingBalances: number;
  totalPaidToAgents: number;
  totalRemainingAgentBalances: number;
  totalBusinessExpenses: number;
  estimatedOverallProfit: number;
  expectedOverallProfit: number;
}

export function calculateOverallBusinessMetrics(
  customers: Customer[],
  customerTransactions: CustomerPaymentTransaction[],
  agentTransactions: AgentPaymentTransaction[],
  agentAssignments: AgentAssignment[]
): BusinessMetrics {
  const totalRegisteredCustomers = customers.length;

  const totalCompletedCases = customers.filter(
    (c) => c.caseStatus === 'Completed' || c.caseStatus === 'Approved'
  ).length;

  const inactiveStatuses: CaseStatus[] = ['Completed', 'Cancelled', 'Rejected'];
  const totalActiveCases = customers.filter(
    (c) => !inactiveStatuses.includes(c.caseStatus)
  ).length;

  const pendingStatuses: CaseStatus[] = [
    'New Inquiry',
    'Documents Pending',
    'Documents Received',
    'Ready to Submit',
    'Submitted to Agent',
    'Processing',
    'Waiting for Customer',
    'Waiting for Agent',
    'Additional Payment Required',
    'On Hold',
  ];
  const totalPendingCases = customers.filter((c) =>
    pendingStatuses.includes(c.caseStatus)
  ).length;

  const totalAgreedFees = customers.reduce(
    (sum, c) => sum + (Number(c.agreedFee) || 0),
    0
  );

  // Ledger totals
  const totalReceipts = customerTransactions
    .filter((tx) => tx.transactionType === 'Customer Receipt')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const totalRefunds = customerTransactions
    .filter((tx) => tx.transactionType === 'Refund to Customer')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const totalNetReceipts = totalReceipts - totalRefunds;

  // Sum of individual customer outstandings (MAX(0, agreed - net))
  const customerFinancialsList = customers.map((c) =>
    calculateCustomerFinancials(c, customerTransactions, agentTransactions, agentAssignments)
  );

  const totalOutstandingBalances = customerFinancialsList.reduce(
    (sum, cf) => sum + cf.outstandingBalance,
    0
  );

  // Authoritative agent payment total
  const totalPaidToAgents = agentTransactions.reduce(
    (sum, tx) => sum + (Number(tx.amount) || 0),
    0
  );

  // Agent remaining balances
  const totalRemainingAgentBalances = agentAssignments.reduce((sum, asgn) => {
    const paidForThisAssignment = agentTransactions
      .filter((tx) => tx.agentId === asgn.agentId && tx.customerId === asgn.customerId)
      .reduce((s, tx) => s + (Number(tx.amount) || 0), 0);
    return sum + Math.max(0, (Number(asgn.agreedAgentCost) || 0) - paidForThisAssignment);
  }, 0);

  const totalBusinessExpenses = customerTransactions
    .filter((tx) => tx.transactionType === 'Business Expense')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const estimatedOverallProfit =
    totalNetReceipts - totalPaidToAgents - totalBusinessExpenses;

  const expectedOverallProfit = customerFinancialsList.reduce(
    (sum, cf) => sum + cf.expectedProfit,
    0
  );

  return {
    totalRegisteredCustomers,
    totalActiveCases,
    totalCompletedCases,
    totalPendingCases,
    totalAgreedFees,
    totalNetReceipts,
    totalOutstandingBalances,
    totalPaidToAgents,
    totalRemainingAgentBalances,
    totalBusinessExpenses,
    estimatedOverallProfit,
    expectedOverallProfit,
  };
}

export function getFollowUpStatus(
  nextFollowUpDate: string,
  caseStatus: CaseStatus
): { isOverdue: boolean; daysRemaining: number | null; label: string } {
  if (!nextFollowUpDate) {
    return { isOverdue: false, daysRemaining: null, label: 'Not Scheduled' };
  }

  const terminalStatuses: CaseStatus[] = ['Completed', 'Cancelled', 'Rejected'];
  if (terminalStatuses.includes(caseStatus)) {
    return { isOverdue: false, daysRemaining: null, label: 'Case Closed' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(nextFollowUpDate);
  targetDate.setHours(0, 0, 0, 0);

  if (isNaN(targetDate.getTime())) {
    return { isOverdue: false, daysRemaining: null, label: 'Invalid Date' };
  }

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      isOverdue: true,
      daysRemaining: diffDays,
      label: `OVERDUE by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`,
    };
  } else if (diffDays === 0) {
    return { isOverdue: false, daysRemaining: 0, label: 'Due Today' };
  } else {
    return {
      isOverdue: false,
      daysRemaining: diffDays,
      label: `In ${diffDays} day${diffDays === 1 ? '' : 's'}`,
    };
  }
}

export function checkCustomerPaymentLedgerWarning(
  tx: CustomerPaymentTransaction,
  customers: Customer[]
): string | null {
  if (!tx.customerId) return 'CHECK: Customer ID nahi mili';
  const customerExists = customers.some((c) => c.id === tx.customerId);
  if (!customerExists) return 'CHECK: Customer ID exist nahi karti';

  if (tx.transactionType === 'Payment to Agent') {
    return 'CHECK: Agent payment AGENT REGISTER mein likhein (double-count se bachne ke liye)';
  }

  if (!tx.amount || tx.amount <= 0) {
    return 'CHECK: Amount missing ya invalid hai';
  }

  return null;
}

export function checkAgentPaymentLedgerWarning(
  tx: AgentPaymentTransaction,
  assignments: AgentAssignment[]
): string | null {
  if (!tx.agentId || !tx.customerId) return 'CHECK: Agent ya Customer ID missing hai';
  
  const isAssigned = assignments.some(
    (a) => a.agentId === tx.agentId && a.customerId === tx.customerId
  );

  if (!isAssigned) {
    return 'CHECK: Is agent ko ye customer assign nahi';
  }

  if (!tx.amount || tx.amount <= 0) {
    return 'CHECK: Amount missing ya invalid hai';
  }

  return null;
}

export function checkCustomerMissingFields(customer: Customer): string[] {
  const missing: string[] = [];
  if (!customer.phone && !customer.whatsapp) missing.push('Phone/WhatsApp');
  if (!customer.serviceCategory) missing.push('Service Category');
  if (!customer.agreedFee || customer.agreedFee <= 0) missing.push('Agreed Fee');
  if (!customer.assignedAgent) missing.push('Assigned Agent');
  return missing;
}
