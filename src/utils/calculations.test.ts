import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCustomerFinancials,
  calculateOverallBusinessMetrics,
  calculateAgentAssignmentFinancials,
  getFollowUpStatus,
  checkCustomerPaymentLedgerWarning,
  checkAgentPaymentLedgerWarning,
} from './calculations';
import {
  Customer,
  CustomerPaymentTransaction,
  AgentAssignment,
  AgentPaymentTransaction,
} from '../types';

const mockCustomer: Customer = {
  id: 'CUST-0001',
  registrationDate: '2026-03-01',
  fullName: 'Muhammad Ali',
  phone: '03001234567',
  whatsapp: '03001234567',
  email: 'ali@example.com',
  city: 'Lahore',
  fullAddress: 'Gulberg III, Lahore',
  serviceCategory: 'Visa',
  destinationCountry: 'Saudi Arabia',
  assignedAgent: 'Al-Haramain Travel Services',
  agreedFee: 150000,
  documentsReceived: 'Yes',
  documentsSentToAgent: 'Yes',
  caseStatus: 'Processing',
  nextFollowUpDate: '2026-04-10',
  lastUpdated: '2026-03-05',
  notes: 'Work visa processing in progress',
};

const mockCustomerTransactions: CustomerPaymentTransaction[] = [
  {
    id: 'TX-1',
    transactionDate: '2026-03-01',
    customerId: 'CUST-0001',
    customerName: 'Muhammad Ali',
    transactionType: 'Customer Receipt',
    amount: 50000,
    paymentMethod: 'Bank Transfer',
    referenceNumber: 'REF-001',
    serviceLine: 'Visa',
    notes: 'Advance deposit',
  },
  {
    id: 'TX-2',
    transactionDate: '2026-03-05',
    customerId: 'CUST-0001',
    customerName: 'Muhammad Ali',
    transactionType: 'Customer Receipt',
    amount: 40000,
    paymentMethod: 'Cash',
    referenceNumber: 'REF-002',
    serviceLine: 'Visa',
    notes: 'Second installment',
  },
  {
    id: 'TX-3',
    transactionDate: '2026-03-08',
    customerId: 'CUST-0001',
    customerName: 'Muhammad Ali',
    transactionType: 'Refund to Customer',
    amount: 10000,
    paymentMethod: 'Bank Transfer',
    referenceNumber: 'REF-003',
    serviceLine: 'Visa',
    notes: 'Medical fee adjustment refund',
  },
  {
    id: 'TX-4',
    transactionDate: '2026-03-09',
    customerId: 'CUST-0001',
    customerName: 'Muhammad Ali',
    transactionType: 'Business Expense',
    amount: 5000,
    paymentMethod: 'Cash',
    referenceNumber: 'EXP-001',
    serviceLine: 'Visa',
    notes: 'Courier and document attestation charges',
  },
];

const mockAgentAssignment: AgentAssignment = {
  agentId: 'AGENT-0001',
  agentName: 'Al-Haramain Travel Services',
  phone: '03219876543',
  whatsapp: '03219876543',
  email: 'info@alharamain.com',
  cityAddress: 'Blue Area, Islamabad',
  customerId: 'CUST-0001',
  customerName: 'Muhammad Ali',
  serviceCategory: 'Visa',
  agreedAgentCost: 90000,
  documentsSent: 'Yes',
  documentsReceived: 'No',
  agentWorkStatus: 'In Progress',
  expectedCompletionDate: '2026-04-15',
  notes: 'Documents submitted to embassy',
};

const mockAgentTransactions: AgentPaymentTransaction[] = [
  {
    id: 'ATX-1',
    paymentDate: '2026-03-03',
    agentId: 'AGENT-0001',
    customerId: 'CUST-0001',
    purpose: 'Visa & Biometrics Fee',
    amount: 40000,
    paymentMethod: 'Bank Transfer',
    referenceNumber: 'AREF-001',
    notes: 'Initial fee paid to agent',
  },
];

test('Customer Financials calculation verifies all 4 core questions', () => {
  const fin = calculateCustomerFinancials(
    mockCustomer,
    mockCustomerTransactions,
    mockAgentTransactions,
    [mockAgentAssignment]
  );

  // Question 1: Customer se ab tak kitne paise liye? (Net Payments = 90,000 - 10,000 = 80,000)
  assert.equal(fin.totalReceipts, 90000);
  assert.equal(fin.totalRefunds, 10000);
  assert.equal(fin.netPayments, 80000);

  // Question 2: Customer se abhi kitne lene hain? (Outstanding = MAX(0, 150000 - 80000) = 70,000)
  assert.equal(fin.outstandingBalance, 70000);
  assert.equal(fin.isOverpaid, false);

  // Agent balances
  assert.equal(fin.agreedAgentCost, 90000);
  assert.equal(fin.totalPaidToAgent, 40000);
  assert.equal(fin.remainingAgentBalance, 50000);

  // Business Expenses
  assert.equal(fin.businessExpenses, 5000);

  // Question 4: Har customer par hamara commission / profit kitna hai?
  // Estimated Profit (Cash basis): Net Payments (80,000) - Paid to Agent (40,000) - Expenses (5,000) = 35,000
  assert.equal(fin.estimatedCommission, 35000);

  // Expected Profit (Accrual): Agreed Fee (150,000) - Agreed Agent (90,000) - Expenses (5,000) = 55,000
  assert.equal(fin.expectedProfit, 55000);
});

test('Overpaid customer shows 0 outstanding balance and marks isOverpaid', () => {
  const overpaidCustomer: Customer = { ...mockCustomer, agreedFee: 60000 };
  const fin = calculateCustomerFinancials(
    overpaidCustomer,
    mockCustomerTransactions,
    mockAgentTransactions,
    [mockAgentAssignment]
  );
  // Net payments is 80,000, agreed fee is 60,000
  assert.equal(fin.outstandingBalance, 0);
  assert.equal(fin.isOverpaid, true);
  assert.equal(fin.overpaidAmount, 20000);
});

test('Overall business metrics calculation sums correctly across all records', () => {
  const metrics = calculateOverallBusinessMetrics(
    [mockCustomer],
    mockCustomerTransactions,
    mockAgentTransactions,
    [mockAgentAssignment]
  );

  // Question 3: Sab customers se total kitne lene hain?
  assert.equal(metrics.totalOutstandingBalances, 70000);
  assert.equal(metrics.totalAgreedFees, 150000);
  assert.equal(metrics.totalNetReceipts, 80000);
  assert.equal(metrics.totalPaidToAgents, 40000);
  assert.equal(metrics.totalRemainingAgentBalances, 50000);
  assert.equal(metrics.totalBusinessExpenses, 5000);
  assert.equal(metrics.estimatedOverallProfit, 35000);
});

test('Follow-up status detects past dates as overdue for active cases', () => {
  const pastStatus = getFollowUpStatus('2020-01-01', 'Processing');
  assert.equal(pastStatus.isOverdue, true);

  const completedStatus = getFollowUpStatus('2020-01-01', 'Completed');
  assert.equal(completedStatus.isOverdue, false);
});

test('Ledger checks warn on invalid or misrouted transactions', () => {
  const warningPaymentToAgent = checkCustomerPaymentLedgerWarning(
    {
      id: 'TX-X',
      transactionDate: '2026-03-01',
      customerId: 'CUST-0001',
      customerName: 'Muhammad Ali',
      transactionType: 'Payment to Agent',
      amount: 10000,
      paymentMethod: 'Cash',
      referenceNumber: 'REF',
      notes: '',
    },
    [mockCustomer]
  );
  assert.match(warningPaymentToAgent || '', /AGENT REGISTER/);

  const warningMissingAgent = checkAgentPaymentLedgerWarning(
    {
      id: 'ATX-Y',
      paymentDate: '2026-03-01',
      agentId: 'AGENT-9999',
      customerId: 'CUST-0001',
      purpose: 'Biometrics',
      amount: 5000,
      paymentMethod: 'Cash',
      referenceNumber: 'REF',
      notes: '',
    },
    [mockAgentAssignment]
  );
  assert.match(warningMissingAgent || '', /assign nahi/);
});

test('calculateAgentAssignmentFinancials calculates agreed, paid, remaining and active status correctly', () => {
  // Test 1: In Progress with partial payment (Agreed: 90,000, Paid: 40,000, Remaining: 50,000)
  const fin1 = calculateAgentAssignmentFinancials(mockAgentAssignment, mockAgentTransactions);
  assert.equal(fin1.agreedCost, 90000);
  assert.equal(fin1.totalPaid, 40000);
  assert.equal(fin1.remainingBalance, 50000);
  assert.equal(fin1.percentPaid, 44);
  assert.equal(fin1.isOverpaid, false);
  assert.equal(fin1.isActive, true);

  // Test 2: Completed assignment with full payment
  const completedAsgn: AgentAssignment = {
    ...mockAgentAssignment,
    agentWorkStatus: 'Completed',
    agreedAgentCost: 40000,
  };
  const fin2 = calculateAgentAssignmentFinancials(completedAsgn, mockAgentTransactions);
  assert.equal(fin2.agreedCost, 40000);
  assert.equal(fin2.totalPaid, 40000);
  assert.equal(fin2.remainingBalance, 0);
  assert.equal(fin2.percentPaid, 100);
  assert.equal(fin2.isOverpaid, false);
  assert.equal(fin2.isActive, false);

  // Test 3: Unpaid active assignment
  const unpaidAsgn: AgentAssignment = {
    ...mockAgentAssignment,
    agentId: 'AGENT-0004',
    serviceCategory: 'Medical',
    agentWorkStatus: 'Waiting for Customer',
    agreedAgentCost: 25000,
  };
  const fin3 = calculateAgentAssignmentFinancials(unpaidAsgn, mockAgentTransactions);
  assert.equal(fin3.agreedCost, 25000);
  assert.equal(fin3.totalPaid, 0);
  assert.equal(fin3.remainingBalance, 25000);
  assert.equal(fin3.percentPaid, 0);
  assert.equal(fin3.isActive, true);
});
