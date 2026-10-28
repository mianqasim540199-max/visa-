export type ServiceCategory =
  | 'Visa'
  | 'Medical'
  | 'Biometrics'
  | 'Immigration'
  | 'Protector / Emigration'
  | 'Air Ticket'
  | 'Document Attestation'
  | 'Translation'
  | 'Consultancy'
  | 'Other Services';

export type CaseStatus =
  | 'New Inquiry'
  | 'Documents Pending'
  | 'Documents Received'
  | 'Ready to Submit'
  | 'Submitted to Agent'
  | 'Processing'
  | 'Waiting for Customer'
  | 'Waiting for Agent'
  | 'Additional Payment Required'
  | 'Approved'
  | 'Rejected'
  | 'Completed'
  | 'On Hold'
  | 'Cancelled';

export type AgentWorkStatus =
  | 'Not Started'
  | 'Documents Pending'
  | 'Submitted to Agent'
  | 'In Progress'
  | 'Waiting for Customer'
  | 'Waiting for Agent'
  | 'Completed'
  | 'On Hold'
  | 'Cancelled';

export type DocumentStatus = 'Yes' | 'No' | 'Partial';

export type PaymentMethod =
  | 'Cash'
  | 'Bank Transfer'
  | 'JazzCash'
  | 'Easypaisa'
  | 'Cheque'
  | 'Other';

export type TransactionType =
  | 'Customer Receipt'
  | 'Refund to Customer'
  | 'Payment to Agent'
  | 'Business Expense';

export interface Customer {
  id: string; // CUST-0001
  registrationDate: string; // YYYY-MM-DD
  fullName: string;
  phone: string;
  whatsapp: string;
  email: string;
  city: string;
  fullAddress: string;
  passportNumber?: string;
  serviceCategory: ServiceCategory;
  destinationCountry: string;
  assignedAgent: string; // Name of agent
  agreedFee: number; // PKR
  documentsReceived: DocumentStatus;
  documentsSentToAgent: DocumentStatus;
  caseStatus: CaseStatus;
  nextFollowUpDate: string; // YYYY-MM-DD
  lastUpdated: string;
  notes: string;
}

export interface CustomerPaymentTransaction {
  id: string;
  transactionDate: string; // YYYY-MM-DD
  customerId: string;
  customerName: string;
  transactionType: TransactionType;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  serviceLine?: ServiceCategory;
  notes: string;
}

export interface AgentAssignment {
  agentId: string; // AGENT-0001
  agentName: string;
  phone: string;
  whatsapp: string;
  email: string;
  cityAddress: string;
  customerId: string; // CUST-0001
  customerName: string;
  serviceCategory: ServiceCategory;
  agreedAgentCost: number; // PKR
  documentsSent: DocumentStatus;
  documentsReceived: DocumentStatus;
  agentWorkStatus: AgentWorkStatus;
  expectedCompletionDate: string;
  notes: string;
}

export interface AgentPaymentTransaction {
  id: string;
  paymentDate: string; // YYYY-MM-DD
  agentId: string;
  customerId: string;
  purpose: string; // e.g. "Biometrics fee", "GAMCA medical token", "Embassy visa sticker"
  serviceLine?: ServiceCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  notes: string;
}

export type CurrencyCode = 'PKR' | 'USD' | 'SAR' | 'AED';

export type UserRole = 'Admin' | 'Accountant' | 'Agent' | 'Viewer';
