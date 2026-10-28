import React, { useState } from 'react';
import {
  Customer,
  CustomerPaymentTransaction,
  AgentAssignment,
  AgentPaymentTransaction,
  CurrencyCode,
  ServiceCategory,
} from '../types';
import {
  calculateCustomerFinancials,
  calculateOverallBusinessMetrics,
  calculateAgentAssignmentFinancials,
  isAgentAssignmentActive,
  getFollowUpStatus,
} from '../utils/calculations';
import { formatCurrency, SERVICE_CATEGORIES } from '../utils/initialData';
import {
  Search,
  User,
  Users,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  Clock,
  Briefcase,
  TrendingUp,
  DollarSign,
  FileText,
  Building2,
  ChevronRight,
  Filter,
  CreditCard,
  Printer,
  Sparkles,
  ExternalLink,
  PlusCircle,
  ArrowUpRight,
} from 'lucide-react';

interface DashboardViewProps {
  customers: Customer[];
  customerTransactions: CustomerPaymentTransaction[];
  agentAssignments: AgentAssignment[];
  agentTransactions: AgentPaymentTransaction[];
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  currency: CurrencyCode;
  onOpenReceipt: () => void;
  onOpenAddTransaction: (defaults?: {
    transactionType?: 'CUSTOMER_RECEIPT' | 'CUSTOMER_REFUND' | 'BUSINESS_EXPENSE' | 'AGENT_PAYMENT';
    customerId?: string;
    agentId?: string;
    serviceLine?: ServiceCategory;
    purpose?: string;
    amount?: number;
  }) => void;
  onOpenAddCustomer: () => void;
  onOpenAddAgent?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  customers,
  customerTransactions,
  agentAssignments,
  agentTransactions,
  selectedCustomerId,
  setSelectedCustomerId,
  currency,
  onOpenReceipt,
  onOpenAddTransaction,
  onOpenAddCustomer,
  onOpenAddAgent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tableFilter, setTableFilter] = useState<'ALL' | 'OUTSTANDING' | 'PAID' | 'ACTIVE' | 'OVERDUE'>('ALL');
  const [assignmentFilter, setAssignmentFilter] = useState<'ACTIVE_ONLY' | 'ALL'>('ACTIVE_ONLY');

  const selectedCustomer =
    customers.find((c) => c.id === selectedCustomerId) || customers[0] || null;

  const fin = selectedCustomer
    ? calculateCustomerFinancials(selectedCustomer, customerTransactions, agentTransactions, agentAssignments)
    : null;

  const metrics = calculateOverallBusinessMetrics(
    customers,
    customerTransactions,
    agentTransactions,
    agentAssignments
  );

  const followUp = selectedCustomer
    ? getFollowUpStatus(selectedCustomer.nextFollowUpDate, selectedCustomer.caseStatus)
    : null;

  // All agent assignments for selected customer
  const customerAllAssignments = selectedCustomer
    ? agentAssignments.filter((a) => a.customerId === selectedCustomer.id)
    : [];

  const customerActiveAssignments = customerAllAssignments.filter((a) =>
    isAgentAssignmentActive(a.agentWorkStatus)
  );

  const displayedAssignments =
    assignmentFilter === 'ACTIVE_ONLY' ? customerActiveAssignments : customerAllAssignments;

  // Aggregate totals across all active assignments for this customer
  const activeAssignmentsFinancials = customerActiveAssignments.map((asgn) =>
    calculateAgentAssignmentFinancials(asgn, agentTransactions)
  );

  const totalActiveAgreedCost = activeAssignmentsFinancials.reduce(
    (sum, a) => sum + a.agreedCost,
    0
  );
  const totalActivePaid = activeAssignmentsFinancials.reduce(
    (sum, a) => sum + a.totalPaid,
    0
  );
  const totalActiveRemaining = activeAssignmentsFinancials.reduce(
    (sum, a) => sum + a.remainingBalance,
    0
  );

  // Selected customer's primary agent assignment (for backward compatibility)
  const customerAgentAssignment = customerAllAssignments[0] || null;

  // Agent payments made specifically for this selected customer
  const customerAgentPayments = selectedCustomer
    ? agentTransactions.filter((tx) => tx.customerId === selectedCustomer.id)
    : [];

  const agentPurposeBreakdown: Record<string, number> = {};
  customerAgentPayments.forEach((tx) => {
    const p = tx.purpose || 'General Case Processing';
    agentPurposeBreakdown[p] = (agentPurposeBreakdown[p] || 0) + (Number(tx.amount) || 0);
  });

  // Filtered customer list for summary table
  const filteredCustomers = customers.filter((cust) => {
    const cFin = calculateCustomerFinancials(cust, customerTransactions, agentTransactions, agentAssignments);
    const fu = getFollowUpStatus(cust.nextFollowUpDate, cust.caseStatus);

    const matchesSearch =
      cust.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.phone.includes(searchTerm) ||
      cust.destinationCountry.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (tableFilter === 'OUTSTANDING') return cFin.outstandingBalance > 0;
    if (tableFilter === 'PAID') return cFin.outstandingBalance === 0;
    if (tableFilter === 'ACTIVE') return !['Completed', 'Cancelled', 'Rejected'].includes(cust.caseStatus);
    if (tableFilter === 'OVERDUE') return fu.isOverdue;

    return true;
  });

  // Service breakdown for selected customer
  const serviceReceiptsMap: Record<string, number> = {};
  SERVICE_CATEGORIES.forEach((cat) => {
    serviceReceiptsMap[cat] = 0;
  });
  let unassignedServiceTotal = 0;

  if (selectedCustomer) {
    const custReceipts = customerTransactions.filter(
      (tx) => tx.customerId === selectedCustomer.id && tx.transactionType === 'Customer Receipt'
    );

    custReceipts.forEach((tx) => {
      if (tx.serviceLine && serviceReceiptsMap[tx.serviceLine] !== undefined) {
        serviceReceiptsMap[tx.serviceLine] += Number(tx.amount) || 0;
      } else {
        unassignedServiceTotal += Number(tx.amount) || 0;
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HIGHLIGHTED CUSTOMER SELECTION BOX */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#0B1F3A] rounded-2xl shadow-xl border border-slate-700/80 p-4 sm:p-6 text-white transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center font-bold text-lg shadow-inner">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                  Customer Selection Box (کسٹمر سلیکٹر)
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
                  Sheet 3 • Cell C4 / D4
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                {selectedCustomer ? selectedCustomer.fullName : 'No Customer Selected'}
                {selectedCustomer && (
                  <span className="text-xs font-mono font-normal bg-teal-900/60 text-teal-300 border border-teal-700 px-2 py-0.5 rounded-full">
                    {selectedCustomer.id}
                  </span>
                )}
              </h2>
            </div>
          </div>

          {/* Customer Dropdown Picker */}
          <div className="flex flex-wrap items-center gap-2.5">
            <label htmlFor="customer-select" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-teal-400" />
              Select Customer:
            </label>
            <select
              id="customer-select"
              aria-label="Select Customer by ID"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="bg-slate-900 border border-teal-500/50 hover:border-teal-400 text-white font-medium text-sm rounded-lg px-3 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer min-w-[240px]"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white py-1">
                  {c.id} — {c.fullName} ({c.serviceCategory} • {c.destinationCountry})
                </option>
              ))}
            </select>

            <button
              onClick={onOpenReceipt}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 transition"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              Print Receipt
            </button>

            <button
              onClick={() => onOpenAddTransaction()}
              className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow transition"
            >
              <CreditCard className="w-3.5 h-3.5" />
              + Add Payment
            </button>
          </div>
        </div>

        {/* Selected Customer Quick Details Bar */}
        {selectedCustomer && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-4 text-xs">
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Phone / Contact</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-emerald-400" />
                {selectedCustomer.phone}
              </span>
            </div>

            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">WhatsApp</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                <MessageCircle className="w-3 h-3 text-emerald-400" />
                {selectedCustomer.whatsapp}
              </span>
            </div>

            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Destination & Service</span>
              <span className="font-semibold text-teal-300 block truncate mt-0.5">
                {selectedCustomer.serviceCategory} • {selectedCustomer.destinationCountry}
              </span>
            </div>

            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Assigned Agent</span>
              <span className="font-semibold text-indigo-300 block truncate mt-0.5">
                {selectedCustomer.assignedAgent || 'Direct / None'}
              </span>
            </div>

            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Case Status</span>
              <span
                className={`inline-block font-semibold mt-0.5 px-2 py-0.5 rounded text-[11px] ${
                  selectedCustomer.caseStatus === 'Completed' || selectedCustomer.caseStatus === 'Approved'
                    ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                    : selectedCustomer.caseStatus === 'Additional Payment Required' ||
                      selectedCustomer.caseStatus === 'Rejected'
                    ? 'bg-rose-900/80 text-rose-300 border border-rose-700'
                    : 'bg-amber-900/80 text-amber-300 border border-amber-700'
                }`}
              >
                {selectedCustomer.caseStatus}
              </span>
            </div>

            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Next Follow-up</span>
              <span
                className={`font-semibold block truncate mt-0.5 ${
                  followUp?.isOverdue ? 'text-rose-400 font-bold' : 'text-slate-200'
                }`}
              >
                {selectedCustomer.nextFollowUpDate} ({followUp?.label})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. THE 4 CORE QUESTIONS DIRECT ANSWER BANNER */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-teal-900/90 via-slate-900 to-indigo-950 rounded-2xl p-5 border border-teal-500/30 shadow-lg text-white">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-base sm:text-lg text-white">
            Naye Sawalon Ka Seedha Jawab (Selected Customer & Sab Customers)
          </h3>
          <span className="text-[11px] bg-teal-500/20 text-teal-300 border border-teal-400/30 px-2 py-0.5 rounded-full font-medium">
            Live Formulas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Question 1: Customer se ab tak kitne paise liye? */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 hover:border-teal-400/50 transition">
            <span className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider block">
              1. Customer se kitne liye?
            </span>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {formatCurrency(fin?.netPayments || 0, currency)}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-300 border-t border-slate-700/60 pt-2">
              <span>Receipts − Refunds:</span>
              <span className="font-mono text-emerald-400">
                {formatCurrency(fin?.totalReceipts || 0, currency)}
                {fin?.totalRefunds ? ` − ${formatCurrency(fin.totalRefunds, currency)}` : ''}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Sirf asal transactions se (Confirmed Net Received)
            </p>
          </div>

          {/* Question 2: Customer se abhi kitne lene hain? */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 hover:border-amber-400/50 transition">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
              2. Customer se kitne lene hain?
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
              {formatCurrency(fin?.outstandingBalance || 0, currency)}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-300 border-t border-slate-700/60 pt-2">
              <span>MAX(0, Agreed − Net):</span>
              <span className="font-mono text-slate-200">
                {formatCurrency(fin?.agreedFee || 0, currency)} − {formatCurrency(fin?.netPayments || 0, currency)}
              </span>
            </div>
            {fin?.isOverpaid ? (
              <p className="text-[11px] text-rose-300 font-medium mt-1">
                ⚠️ Customer ne fee se zyada diya ({formatCurrency(fin.overpaidAmount, currency)})
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">
                Customer Outstanding Balance (Baqi Rakam)
              </p>
            )}
          </div>

          {/* Question 3: Sab customers se total kitne lene hain? */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 hover:border-sky-400/50 transition">
            <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider block">
              3. Sab customers se total kitne lene hain?
            </span>
            <div className="text-xl sm:text-2xl font-black text-sky-300 mt-1">
              {formatCurrency(metrics.totalOutstandingBalances, currency)}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-300 border-t border-slate-700/60 pt-2">
              <span>Total Outstanding Sum:</span>
              <span className="font-mono text-sky-200">Across {customers.length} Customers</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Poore business ka kul receivable balance
            </p>
          </div>

          {/* Question 4: Har customer par hamara commission / profit kitna hai? */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 hover:border-emerald-400/50 transition">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
              4. Hamara commission / profit?
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
              {formatCurrency(fin?.estimatedCommission || 0, currency)}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-300 border-t border-slate-700/60 pt-2">
              <span>Estimated (Cash Basis):</span>
              <span className="text-[11px] text-emerald-300">Asal Cash par</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>Expected (Poora aane par):</span>
              <span className="font-semibold text-slate-200">{formatCurrency(fin?.expectedProfit || 0, currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. FINANCIAL SUMMARY (SELECTED CUSTOMER) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Financial Summary — {selectedCustomer?.fullName} ({selectedCustomer?.id})
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Sheet 3 • Section B
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2.5 px-3">Item / Label</th>
                  <th className="py-2.5 px-3">Formula / Source</th>
                  <th className="py-2.5 px-3 text-right">Amount ({currency})</th>
                  <th className="py-2.5 px-3 text-center">Type / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                    Agreed Customer Fee
                  </td>
                  <td className="py-2 px-3 text-slate-500">Tay shuda agreed fee</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                    {formatCurrency(fin?.agreedFee || 0, currency)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-[11px]">
                      Agreed (Tay shuda)
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-slate-800 dark:text-slate-200">
                    Total Customer Receipts
                  </td>
                  <td className="py-2 px-3 text-slate-500">SUMIFS from Customer Receipts</td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(fin?.totalReceipts || 0, currency)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded text-[11px]">
                      Actual Received
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-slate-800 dark:text-slate-200">
                    Total Refunds
                  </td>
                  <td className="py-2 px-3 text-slate-500">SUMIFS from Refunds ledger</td>
                  <td className="py-2 px-3 text-right font-mono text-rose-600 dark:text-rose-400">
                    {fin?.totalRefunds ? `− ${formatCurrency(fin.totalRefunds, currency)}` : '0'}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded text-[11px]">
                      Refund
                    </span>
                  </td>
                </tr>

                <tr className="bg-teal-50/50 dark:bg-teal-950/20 font-semibold">
                  <td className="py-2 px-3 text-teal-900 dark:text-teal-200">
                    Net Customer Payments
                  </td>
                  <td className="py-2 px-3 text-teal-700 dark:text-teal-300">
                    Total Receipts − Total Refunds
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-teal-700 dark:text-teal-300">
                    {formatCurrency(fin?.netPayments || 0, currency)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 px-2 py-0.5 rounded text-[11px]">
                      Net Asal Mila
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-semibold text-amber-700 dark:text-amber-400">
                    Customer Outstanding Balance
                  </td>
                  <td className="py-2 px-3 text-slate-500">MAX(0, Agreed Fee − Net Payments)</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-amber-700 dark:text-amber-400">
                    {formatCurrency(fin?.outstandingBalance || 0, currency)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded text-[11px]">
                      Outstanding (Baqi)
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-slate-800 dark:text-slate-200">
                    Agreed Agent Cost
                  </td>
                  <td className="py-2 px-3 text-slate-500">AGENT REGISTER se</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                    {formatCurrency(fin?.agreedAgentCost || 0, currency)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-[11px]">
                      Agreed Agent Cost
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-slate-800 dark:text-slate-200">
                    Total Paid to Agent
                  </td>
                  <td className="py-2 px-3 text-slate-500">Authoritative: AGENT REGISTER ledger</td>
                  <td className="py-2 px-3 text-right font-mono text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(fin?.totalPaidToAgent || 0, currency)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded text-[11px]">
                      Actual Paid (Asal Diya)
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-slate-800 dark:text-slate-200">
                    Remaining Agent Balance
                  </td>
                  <td className="py-2 px-3 text-slate-500">MAX(0, Agreed Cost − Paid to Agent)</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                    {formatCurrency(fin?.remainingAgentBalance || 0, currency)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-[11px]">
                      Agent Payable
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-slate-800 dark:text-slate-200">
                    Business Expenses
                  </td>
                  <td className="py-2 px-3 text-slate-500">Ledger direct expenses (TCS, fees)</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                    {formatCurrency(fin?.businessExpenses || 0, currency)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-[11px]">
                      Actual Expense
                    </span>
                  </td>
                </tr>

                <tr className="bg-emerald-50 dark:bg-emerald-950/30 border-t-2 border-emerald-300 dark:border-emerald-700">
                  <td className="py-2.5 px-3 font-bold text-emerald-900 dark:text-emerald-300">
                    Estimated Commission / Profit (Cash Basis)
                  </td>
                  <td className="py-2.5 px-3 text-emerald-800 dark:text-emerald-400">
                    Net Payments − Paid to Agent − Expenses
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">
                    {formatCurrency(fin?.estimatedCommission || 0, currency)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                      Estimated (Andaza)
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">
                    Expected Profit (Agar poori payment aa jaye)
                  </td>
                  <td className="py-2 px-3 text-slate-500">
                    Agreed Fee − Agreed Agent Cost − Expenses
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                    {formatCurrency(fin?.expectedProfit || 0, currency)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-[11px]">
                      Expected (Full)
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {fin?.isOverpaid && (
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-lg flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Jaiza Lein:</strong> Customer ne agreed fee se zyada ada kar diya hai (Extra: {formatCurrency(fin.overpaidAmount, currency)}). Outstanding balance 0 dikhaya ja raha hai.
              </span>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CASE PROGRESS & SERVICE BREAKDOWN */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-6">
          {/* Case Progress Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-3 text-sm">
              <Clock className="w-4 h-4 text-teal-600" />
              Case Progress & Workflow Tracker
            </h3>

            {selectedCustomer && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Documents Received?</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded ${
                      selectedCustomer.documentsReceived === 'Yes'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                        : selectedCustomer.documentsReceived === 'Partial'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                    }`}
                  >
                    {selectedCustomer.documentsReceived}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Documents Sent to Agent?</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded ${
                      selectedCustomer.documentsSentToAgent === 'Yes'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                        : selectedCustomer.documentsSentToAgent === 'Partial'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {selectedCustomer.documentsSentToAgent}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Agent Work Status:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {customerAgentAssignment?.agentWorkStatus || 'Not Assigned / Direct'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Current Case Status:</span>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {selectedCustomer.caseStatus}
                  </span>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Next Follow-up Date:</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {selectedCustomer.nextFollowUpDate}
                    </span>
                  </div>

                  {followUp?.isOverdue ? (
                    <div className="mt-2 p-2 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded text-rose-700 dark:text-rose-300 flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      OVERDUE: Follow-up date guzar chuki hai ({Math.abs(followUp.daysRemaining || 0)} din pehle)!
                    </div>
                  ) : (
                    <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-teal-500" />
                      {followUp?.label}
                    </div>
                  )}
                </div>

                {selectedCustomer.notes && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 mt-2">
                    <span className="text-slate-400 text-[11px] block font-semibold mb-1">
                      Case Notes & Next Action:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                      {selectedCustomer.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Service Breakdown Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-3 text-sm">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              Service Line Breakdown (Receipts)
            </h3>
            <p className="text-[11px] text-slate-500 mb-2">
              Payments breakdown by service for this customer (Double-counting protected).
            </p>

            <div className="space-y-1.5 text-xs max-h-56 overflow-y-auto">
              {SERVICE_CATEGORIES.map((cat) => {
                const amount = serviceReceiptsMap[cat] || 0;
                if (amount === 0 && cat !== selectedCustomer?.serviceCategory) return null;
                return (
                  <div
                    key={cat}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      amount > 0 ? 'bg-slate-50 dark:bg-slate-800/80 font-medium' : 'text-slate-400'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(amount, currency)}
                    </span>
                  </div>
                );
              })}

              {unassignedServiceTotal > 0 && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200">
                  <span>Unassigned Receipts</span>
                  <span className="font-mono font-semibold">
                    {formatCurrency(unassignedServiceTotal, currency)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3.4 ACTIVE AGENT ASSIGNMENTS & PURPOSE FINANCIALS */}
      {/* (منتخب گاہک کے فعال ایجنٹ معاہدے اور واجبات) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-slate-800 dark:text-white text-base">
                  Active Agent Assignments & Purpose Financials
                </h3>
                <span className="text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {customerActiveAssignments.length} Active {customerActiveAssignments.length === 1 ? 'Service' : 'Services'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  (فعال ایجنٹ تفویض اور واجبات)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Active service assignments for <strong className="text-slate-700 dark:text-slate-300">{selectedCustomer?.fullName} ({selectedCustomer?.id})</strong> showing agreed cost, actual paid to date, and remaining balance for each specific agent-service purpose.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Toggle: Active Only vs All */}
            <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg flex items-center text-xs">
              <button
                onClick={() => setAssignmentFilter('ACTIVE_ONLY')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  assignmentFilter === 'ACTIVE_ONLY'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Active Only ({customerActiveAssignments.length})
              </button>
              <button
                onClick={() => setAssignmentFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  assignmentFilter === 'ALL'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                All ({customerAllAssignments.length})
              </button>
            </div>

            {onOpenAddAgent && (
              <button
                onClick={onOpenAddAgent}
                className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
              >
                <PlusCircle className="w-3.5 h-3.5" /> + Assign Agent
              </button>
            )}
          </div>
        </div>

        {/* Section Mini KPI Strip for this customer */}
        {customerActiveAssignments.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50/80 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block">Active Services:</span>
              <span className="font-bold text-slate-800 dark:text-white text-sm">
                {customerActiveAssignments.length} Assignments
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Total Agreed Cost:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-white text-sm">
                {formatCurrency(totalActiveAgreedCost, currency)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Total Paid to Date:</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                {formatCurrency(totalActivePaid, currency)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Total Remaining Balance:</span>
              <span className={`font-mono font-bold text-sm ${totalActiveRemaining > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {formatCurrency(totalActiveRemaining, currency)}
              </span>
            </div>
          </div>
        )}

        {/* Assignments Cards List */}
        {displayedAssignments.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
              {assignmentFilter === 'ACTIVE_ONLY'
                ? `Is customer (${selectedCustomer?.fullName}) ke liye koi active agent assignment mojood nahi hai.`
                : `Is customer (${selectedCustomer?.fullName}) ke liye koi agent assignment record nahi mila.`}
            </p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              Tamam services mukammal ho chuki hain ya direct handle ki ja rahi hain. Naya agent assign karne ke liye neeche button dabayein.
            </p>
            {onOpenAddAgent && (
              <button
                onClick={onOpenAddAgent}
                className="mt-2 inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" /> + Assign Agent for {selectedCustomer?.fullName}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {displayedAssignments.map((asgn) => {
              const asgnFin = calculateAgentAssignmentFinancials(asgn, agentTransactions);

              // Service category badge style
              const serviceColors: Record<string, { bg: string; text: string; border: string }> = {
                Visa: { bg: 'bg-blue-50 dark:bg-blue-950/50', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
                Biometrics: { bg: 'bg-purple-50 dark:bg-purple-950/50', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
                Medical: { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
                'Protector / Emigration': { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
                'Air Ticket': { bg: 'bg-sky-50 dark:bg-sky-950/50', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800' },
                'Document Attestation': { bg: 'bg-indigo-50 dark:bg-indigo-950/50', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
              };
              const col = serviceColors[asgn.serviceCategory] || {
                bg: 'bg-slate-50 dark:bg-slate-800',
                text: 'text-slate-700 dark:text-slate-300',
                border: 'border-slate-200 dark:border-slate-700',
              };

              // Work status chip styling
              const isFinished = asgn.agentWorkStatus === 'Completed';
              const isCancelled = asgn.agentWorkStatus === 'Cancelled';

              return (
                <div
                  key={`${asgn.agentId}-${asgn.customerId}-${asgn.serviceCategory}`}
                  className={`rounded-xl border p-4.5 transition-all flex flex-col justify-between ${
                    asgnFin.isActive
                      ? 'bg-gradient-to-b from-white to-slate-50/70 dark:from-slate-800/80 dark:to-slate-900 border-slate-200 dark:border-slate-700/80 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700'
                      : 'bg-slate-50/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 opacity-90'
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Card Top: Service Purpose & Agent */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-bold border ${col.bg} ${col.text} ${col.border}`}
                          >
                            {asgn.serviceCategory}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {asgn.notes ? asgn.notes.split('.')[0] : `${asgn.serviceCategory} Processing`}
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {asgn.agentName}
                          </span>
                          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded">
                            {asgn.agentId}
                          </span>
                          {asgn.cityAddress && (
                            <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                              • {asgn.cityAddress.split(',')[0]}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Work Status Badge */}
                      <div className="shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            asgn.agentWorkStatus === 'Completed'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : asgn.agentWorkStatus === 'Cancelled'
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                              : asgn.agentWorkStatus === 'In Progress'
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                          }`}
                        >
                          {asgnFin.isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                          )}
                          {asgn.agentWorkStatus === 'Completed' && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          )}
                          {asgn.agentWorkStatus}
                        </span>
                      </div>
                    </div>

                    {/* 3 Core Financial Pillars (Agreed, Paid, Remaining) */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-100/70 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-center">
                      {/* Agreed Cost */}
                      <div className="p-1.5">
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">
                          Agreed Cost (طے شدہ)
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs sm:text-sm block mt-0.5">
                          {formatCurrency(asgnFin.agreedCost, currency)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">Agent contract</span>
                      </div>

                      {/* Total Paid */}
                      <div className="p-1.5 border-x border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block uppercase font-medium">
                          Total Paid (ادا شدہ)
                        </span>
                        <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm block mt-0.5">
                          {formatCurrency(asgnFin.totalPaid, currency)}
                        </span>
                        <span className="text-[10px] text-indigo-500/80 block">
                          {asgnFin.percentPaid}% paid
                        </span>
                      </div>

                      {/* Remaining Balance */}
                      <div className="p-1.5">
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 block uppercase font-medium">
                          Remaining (باقی رقم)
                        </span>
                        <span
                          className={`font-mono font-bold text-xs sm:text-sm block mt-0.5 ${
                            asgnFin.remainingBalance > 0
                              ? 'text-amber-700 dark:text-amber-300'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {formatCurrency(asgnFin.remainingBalance, currency)}
                        </span>
                        <span className="text-[10px] block">
                          {asgnFin.remainingBalance === 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              ✓ Fully Settled
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                              Baqi Payable
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Payment Progress:</span>
                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {asgnFin.percentPaid}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-700/80 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            asgnFin.percentPaid >= 100
                              ? 'bg-emerald-500'
                              : asgnFin.percentPaid > 0
                              ? 'bg-indigo-600 dark:bg-indigo-500'
                              : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                          style={{ width: `${Math.min(100, asgnFin.percentPaid)}%` }}
                        />
                      </div>
                    </div>

                    {/* Operational Context: Target Date & Documents */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Expected: </span>
                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {asgn.expectedCompletionDate || 'Not specified'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span>Docs Sent: <strong className={asgn.documentsSent === 'Yes' ? 'text-emerald-600' : 'text-amber-600'}>{asgn.documentsSent}</strong></span>
                        <span>•</span>
                        <span>Docs Recv: <strong className={asgn.documentsReceived === 'Yes' ? 'text-emerald-600' : 'text-slate-500'}>{asgn.documentsReceived}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Quick Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {asgn.phone && (
                        <a
                          href={`tel:${asgn.phone}`}
                          title={`Call ${asgn.agentName}`}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {asgn.whatsapp && (
                        <a
                          href={`https://wa.me/${asgn.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Assalam-o-Alaikum, regarding customer ${selectedCustomer?.fullName} (${selectedCustomer?.id}) for ${asgn.serviceCategory} processing:`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          title="WhatsApp Agent"
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        onOpenAddTransaction({
                          transactionType: 'AGENT_PAYMENT',
                          customerId: asgn.customerId,
                          agentId: asgn.agentId,
                          serviceLine: asgn.serviceCategory,
                          purpose: `${asgn.serviceCategory} Processing Fee`,
                          amount: asgnFin.remainingBalance > 0 ? asgnFin.remainingBalance : 10000,
                        })
                      }
                      className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-xs"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      + Pay Agent for {asgn.serviceCategory}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3.5 AGENT DISBURSEMENTS & PURPOSE BREAKDOWN (مقصد اور ایجنٹ ادائیگی) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                Agent ko Gaye Huway Paise & Purpose (کس مقصد کے لیے ایجنٹ کو رقم گئی)
                <span className="text-xs font-normal bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 px-2 py-0.5 rounded-full">
                  Customer Linked
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Customer <strong className="text-slate-700 dark:text-slate-300">{selectedCustomer?.fullName} ({selectedCustomer?.id})</strong> ke agent disbursements ki mukammal tafseel ba-shumul maqsad (Biometrics, Visa Stamping, GAMCA, Ticket, etc.)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Total Paid to Agent:</span>
            <span className="font-mono font-black text-sm text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
              {formatCurrency(fin?.totalPaidToAgent || 0, currency)}
            </span>
          </div>
        </div>

        {/* Purpose-wise Summary Chips */}
        {Object.keys(agentPurposeBreakdown).length > 0 && (
          <div className="mb-4 p-3 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-100 dark:border-purple-900/60">
            <span className="text-xs font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wider block mb-2">
              Purpose-wise Breakdown (مقصد کے لحاظ سے تفصیل):
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(agentPurposeBreakdown).map(([purpose, amt]) => (
                <div
                  key={purpose}
                  className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-700/60 shadow-xs flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{purpose}:</span>
                  <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400">
                    {formatCurrency(amt, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Itemized Agent Payment Ledger for Selected Customer */}
        {customerAgentPayments.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
            <p className="text-xs text-slate-500">
              Abhi tak is customer (<strong className="text-slate-700 dark:text-slate-300">{selectedCustomer?.fullName}</strong>) ka koi payment agent ko nahi bheja gaya.
            </p>
            <button
              onClick={() =>
                onOpenAddTransaction({
                  transactionType: 'AGENT_PAYMENT',
                  customerId: selectedCustomer?.id,
                })
              }
              className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            >
              <CreditCard className="w-3.5 h-3.5" /> + Pay Agent for this Customer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-purple-900/10 dark:bg-purple-950/40 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] font-bold border-b border-purple-200 dark:border-purple-800/60">
                  <th className="py-2.5 px-3">Date (تاریخ)</th>
                  <th className="py-2.5 px-3">Agent Name & ID</th>
                  <th className="py-2.5 px-3">Payment Purpose / Maqsad (کس مقصد کے لیے)</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Receipt / Ref #</th>
                  <th className="py-2.5 px-3 text-right">Amount ({currency})</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {customerAgentPayments.map((tx) => {
                  const assignment = agentAssignments.find((a) => a.agentId === tx.agentId);
                  const agentDisplayName = assignment ? assignment.agentName : tx.agentId;

                  return (
                    <tr key={tx.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{tx.paymentDate}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-900 dark:text-white block">{agentDisplayName}</span>
                        <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">{tx.agentId}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1.5 font-bold text-purple-800 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-950 px-2.5 py-1 rounded-md border border-purple-300 dark:border-purple-800">
                          🎯 {tx.purpose || 'General Processing'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{tx.paymentMethod}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{tx.referenceNumber || '—'}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-700 dark:text-purple-300 text-xs">
                        {formatCurrency(tx.amount, currency)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">{tx.notes || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. OVERALL BUSINESS DASHBOARD CARDS (11 CARDS) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-base">
              <Building2 className="w-5 h-5 text-teal-600" />
              Overall Business Cards (Poore Business Ka Khulasa)
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated from Customer Register, Agent Register, and Payment Ledgers.
            </p>
          </div>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono px-2 py-1 rounded">
            Sheet 3 • Section E
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
              Registered Customers
            </span>
            <span className="text-lg font-bold text-slate-800 dark:text-white block mt-1">
              {metrics.totalRegisteredCustomers}
            </span>
            <span className="text-[10px] text-slate-400">Total database records</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 block font-medium">
              Completed Cases
            </span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 block mt-1">
              {metrics.totalCompletedCases}
            </span>
            <span className="text-[10px] text-slate-400">Approved / Completed</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-indigo-600 dark:text-indigo-400 block font-medium">
              Active Cases
            </span>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 block mt-1">
              {metrics.totalActiveCases}
            </span>
            <span className="text-[10px] text-slate-400">Currently in progress</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-amber-600 dark:text-amber-400 block font-medium">
              Pending Cases
            </span>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400 block mt-1">
              {metrics.totalPendingCases}
            </span>
            <span className="text-[10px] text-slate-400">Action or docs awaited</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
              Agreed Customer Fees
            </span>
            <span className="text-sm font-mono font-bold text-slate-800 dark:text-white block mt-1 truncate">
              {formatCurrency(metrics.totalAgreedFees, currency)}
            </span>
            <span className="text-[10px] text-slate-400">Total contracted</span>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <span className="text-xs text-emerald-700 dark:text-emerald-300 block font-bold">
              Total Customer Receipts
            </span>
            <span className="text-sm font-mono font-black text-emerald-700 dark:text-emerald-400 block mt-1 truncate">
              {formatCurrency(metrics.totalNetReceipts, currency)}
            </span>
            <span className="text-[10px] text-emerald-600/80">Net Receipts − Refunds</span>
          </div>

          {/* Highlighted: Total kitna lena hai */}
          <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-300 dark:border-amber-800">
            <span className="text-xs text-amber-800 dark:text-amber-300 block font-bold">
              Total Outstanding Balances
            </span>
            <span className="text-base font-mono font-black text-amber-800 dark:text-amber-400 block mt-1 truncate">
              {formatCurrency(metrics.totalOutstandingBalances, currency)}
            </span>
            <span className="text-[10px] text-amber-700">Total kitna lena hai</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-indigo-600 dark:text-indigo-400 block font-medium">
              Total Paid to Agents
            </span>
            <span className="text-sm font-mono font-bold text-indigo-700 dark:text-indigo-300 block mt-1 truncate">
              {formatCurrency(metrics.totalPaidToAgents, currency)}
            </span>
            <span className="text-[10px] text-slate-400">Authoritative payments</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
              Remaining Agent Balances
            </span>
            <span className="text-sm font-mono font-bold text-slate-800 dark:text-white block mt-1 truncate">
              {formatCurrency(metrics.totalRemainingAgentBalances, currency)}
            </span>
            <span className="text-[10px] text-slate-400">Pending to agents</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
              Business Expenses
            </span>
            <span className="text-sm font-mono font-bold text-slate-800 dark:text-white block mt-1 truncate">
              {formatCurrency(metrics.totalBusinessExpenses, currency)}
            </span>
            <span className="text-[10px] text-slate-400">Direct client expenses</span>
          </div>

          {/* Estimated Overall Profit */}
          <div className="bg-teal-50 dark:bg-teal-950/40 p-3 rounded-xl border border-teal-300 dark:border-teal-700 col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-teal-800 dark:text-teal-300 font-bold">
                Estimated Overall Profit (Cash Basis)
              </span>
              <span className="text-[10px] bg-teal-200 dark:bg-teal-900 text-teal-800 dark:text-teal-200 px-1.5 py-0.5 rounded">
                Net Receipts − Agent Paid − Exp
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-mono font-black text-teal-700 dark:text-teal-300">
                {formatCurrency(metrics.estimatedOverallProfit, currency)}
              </span>
              <span className="text-xs text-slate-500">
                Expected (Full): {formatCurrency(metrics.expectedOverallProfit, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. CUSTOMER-WISE SUMMARY TABLE (HAR CUSTOMER EK LINE MEIN) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              Customer-wise Financial Summary Table (ہر کسٹمر کا ایک لائن میں حساب)
            </h3>
            <p className="text-xs text-slate-500">
              Click any customer row to instantly inspect their full case on the top dashboard.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {(
                [
                  { id: 'ALL', label: 'All Customers' },
                  { id: 'OUTSTANDING', label: 'Has Outstanding' },
                  { id: 'PAID', label: 'Fully Paid' },
                  { id: 'ACTIVE', label: 'Active Cases' },
                  { id: 'OVERDUE', label: 'Overdue Follow-up' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTableFilter(f.id)}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    tableFilter === f.id
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button
              onClick={onOpenAddCustomer}
              className="bg-teal-600 hover:bg-teal-500 text-white font-medium px-3 py-1.5 rounded-lg transition"
            >
              + New Customer
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="mb-3 relative max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, ID, phone, destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#0B1F3A] text-white uppercase tracking-wider text-[11px] font-semibold">
                <th className="py-2.5 px-3">Customer ID</th>
                <th className="py-2.5 px-3">Customer Name</th>
                <th className="py-2.5 px-3">Service & Destination</th>
                <th className="py-2.5 px-3 text-right">Agreed Fee</th>
                <th className="py-2.5 px-3 text-right">Received (Net)</th>
                <th className="py-2.5 px-3 text-right">Outstanding (Lene Hain)</th>
                <th className="py-2.5 px-3 text-right">Paid to Agent</th>
                <th className="py-2.5 px-3 text-right">Expenses</th>
                <th className="py-2.5 px-3 text-right">Estimated Profit</th>
                <th className="py-2.5 px-3 text-center">Case Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    No customers match the current filter or search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const cFin = calculateCustomerFinancials(
                    cust,
                    customerTransactions,
                    agentTransactions,
                    agentAssignments
                  );
                  const isSelected = cust.id === selectedCustomerId;

                  return (
                    <tr
                      key={cust.id}
                      onClick={() => setSelectedCustomerId(cust.id)}
                      className={`cursor-pointer transition ${
                        isSelected
                          ? 'bg-teal-50 dark:bg-teal-950/40 font-medium'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-teal-600 dark:text-teal-400">
                        {cust.id}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                        {cust.fullName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                        {cust.serviceCategory} • {cust.destinationCountry}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {formatCurrency(cFin.agreedFee, currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        {formatCurrency(cFin.netPayments, currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        {cFin.outstandingBalance > 0 ? (
                          <span className="text-amber-600 dark:text-amber-400">
                            {formatCurrency(cFin.outstandingBalance, currency)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                            <CheckCircle className="w-3 h-3" /> Fully Paid
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                        {formatCurrency(cFin.totalPaidToAgent, currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        {formatCurrency(cFin.businessExpenses, currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-600 dark:text-teal-400">
                        {formatCurrency(cFin.estimatedCommission, currency)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            cust.caseStatus === 'Completed' || cust.caseStatus === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : cust.caseStatus === 'Additional Payment Required' ||
                                cust.caseStatus === 'Rejected'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {cust.caseStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomerId(cust.id);
                          }}
                          className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
