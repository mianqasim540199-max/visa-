import React, { useState } from 'react';
import {
  Customer,
  CustomerPaymentTransaction,
  AgentAssignment,
  AgentPaymentTransaction,
  CurrencyCode,
  CaseStatus,
  ServiceCategory,
} from '../types';
import {
  calculateCustomerFinancials,
  checkCustomerPaymentLedgerWarning,
  checkCustomerMissingFields,
} from '../utils/calculations';
import { formatCurrency, SERVICE_CATEGORIES, CASE_STATUSES } from '../utils/initialData';
import {
  Search,
  Plus,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  Table,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

interface CustomerRegisterViewProps {
  customers: Customer[];
  customerTransactions: CustomerPaymentTransaction[];
  agentAssignments: AgentAssignment[];
  agentTransactions: AgentPaymentTransaction[];
  currency: CurrencyCode;
  onOpenAddCustomer: () => void;
  onOpenAddTransaction: () => void;
  onSelectCustomer: (id: string) => void;
  onUpdateCustomerStatus: (id: string, status: CaseStatus) => void;
}

export const CustomerRegisterView: React.FC<CustomerRegisterViewProps> = ({
  customers,
  customerTransactions,
  agentAssignments,
  agentTransactions,
  currency,
  onOpenAddCustomer,
  onOpenAddTransaction,
  onSelectCustomer,
  onUpdateCustomerStatus,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ALL' | 'CUSTOMERS' | 'LEDGER'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Duplicate ID Check
  const idSet = new Set<string>();
  let hasDuplicateId = false;
  for (const c of customers) {
    if (idSet.has(c.id)) {
      hasDuplicateId = true;
      break;
    }
    idSet.add(c.id);
  }

  // Missing critical data count
  const customersWithMissingData = customers.filter((c) => checkCustomerMissingFields(c).length > 0);

  // Filtered customers
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.destinationCountry.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesService = serviceFilter === 'ALL' || c.serviceCategory === serviceFilter;
    const matchesStatus = statusFilter === 'ALL' || c.caseStatus === statusFilter;

    return matchesSearch && matchesService && matchesStatus;
  });

  // Filtered transactions
  const filteredTransactions = customerTransactions.filter((tx) => {
    return (
      tx.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.transactionType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-4">
      {/* Worksheet Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded">
                Worksheet 1
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                CUSTOMER REGISTER & PAYMENT LEDGER
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Columns A–X: Customer Master Table • Columns Z–AI: Customer Payment Ledger
            </p>
          </div>

          {/* Quick Sub-view selector & Actions */}
          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveSubTab('ALL')}
                className={`px-2.5 py-1.5 rounded-md transition ${
                  activeSubTab === 'ALL'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Split View (Both)
              </button>
              <button
                onClick={() => setActiveSubTab('CUSTOMERS')}
                className={`px-2.5 py-1.5 rounded-md transition ${
                  activeSubTab === 'CUSTOMERS'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Customer Database (A-X)
              </button>
              <button
                onClick={() => setActiveSubTab('LEDGER')}
                className={`px-2.5 py-1.5 rounded-md transition ${
                  activeSubTab === 'LEDGER'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Payment Ledger (Z-AI)
              </button>
            </div>

            <button
              onClick={onOpenAddCustomer}
              className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Customer
            </button>
            <button
              onClick={onOpenAddTransaction}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Record Payment
            </button>
          </div>
        </div>

        {/* Data Validation & Integrity Badges */}
        <div className="flex flex-wrap items-center gap-3 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            {hasDuplicateId ? (
              <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-300">
                <AlertTriangle className="w-3.5 h-3.5" /> WARNING: Duplicate Customer ID
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5" /> Customer IDs OK
              </span>
            )}
          </div>

          <div>
            {customersWithMissingData.length > 0 ? (
              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                CHECK: {customersWithMissingData.length} records have missing Phone/Service/Fee
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-teal-500" /> All Customer Data Complete
              </span>
            )}
          </div>

          <div className="text-slate-400 text-[11px] ml-auto">
            Accounting Rule: Agreed fee received nahi banta. Asal received sirf Ledger se aati hai.
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search records by Name, ID, Phone, Destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="filter-service" className="text-slate-500 font-medium">Service:</label>
          <select
            id="filter-service"
            aria-label="Filter by Service Category"
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Services</option>
            {SERVICE_CATEGORIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <label htmlFor="filter-status" className="text-slate-500 font-medium">Status:</label>
          <select
            id="filter-status"
            aria-label="Filter by Case Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Statuses</option>
            {CASE_STATUSES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="space-y-6">
        {/* SECTION 1: CUSTOMER MASTER TABLE (A-X) */}
        {(activeSubTab === 'ALL' || activeSubTab === 'CUSTOMERS') && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-[#0B1F3A] px-4 py-2.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-teal-400" />
                <span className="font-bold text-xs uppercase tracking-wider">
                  Customer Master Register (Columns A – X)
                </span>
                <span className="text-[11px] text-teal-300 font-normal">
                  ({filteredCustomers.length} Records)
                </span>
              </div>
              <span className="text-[11px] text-slate-300">
                Formula driven: Received • Outstanding • Commission
              </span>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 sticky top-0 z-10 shadow-sm border-b border-slate-200 dark:border-slate-700">
                  <tr className="uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">A: Customer ID</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">B: Reg Date</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">C: Full Name</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">D: Phone</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">E: WhatsApp</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">F: Email</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">G: City</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">H: Address</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">I: Passport</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">J: Service</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">K: Destination</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">L: Assigned Agent</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-200 dark:border-slate-700">M: Agreed Fee</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400">N: Total Received</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-200 dark:border-slate-700 text-amber-700 dark:text-amber-400">O: Outstanding</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-200 dark:border-slate-700">P: Agent Paid</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-200 dark:border-slate-700">Q: Expense</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-200 dark:border-slate-700 text-teal-700 dark:text-teal-400">R: Est Commission</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-200 dark:border-slate-700">S: Docs Recv</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-200 dark:border-slate-700">T: Docs Agent</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-200 dark:border-slate-700">U: Case Status</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">V: Next Follow-up</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">W: Updated</th>
                    <th className="py-2.5 px-3">X: Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCustomers.map((cust) => {
                    const cFin = calculateCustomerFinancials(
                      cust,
                      customerTransactions,
                      agentTransactions,
                      agentAssignments
                    );
                    const missing = checkCustomerMissingFields(cust);

                    return (
                      <tr
                        key={cust.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
                        onClick={() => onSelectCustomer(cust.id)}
                      >
                        <td className="py-2 px-3 font-mono font-bold text-teal-600 dark:text-teal-400 border-r border-slate-100 dark:border-slate-800">
                          {cust.id}
                        </td>
                        <td className="py-2 px-3 text-slate-500 border-r border-slate-100 dark:border-slate-800">
                          {cust.registrationDate}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white border-r border-slate-100 dark:border-slate-800">
                          {cust.fullName}
                          {missing.length > 0 && (
                            <span className="ml-1 text-[10px] text-amber-500" title={`Missing: ${missing.join(', ')}`}>⚠️</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono border-r border-slate-100 dark:border-slate-800">
                          {cust.phone}
                        </td>
                        <td className="py-2 px-3 font-mono border-r border-slate-100 dark:border-slate-800">
                          {cust.whatsapp}
                        </td>
                        <td className="py-2 px-3 text-slate-500 border-r border-slate-100 dark:border-slate-800">
                          {cust.email}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-100 dark:border-slate-800">{cust.city}</td>
                        <td className="py-2 px-3 max-w-xs truncate border-r border-slate-100 dark:border-slate-800" title={cust.fullAddress}>
                          {cust.fullAddress}
                        </td>
                        <td className="py-2 px-3 font-mono border-r border-slate-100 dark:border-slate-800">
                          {cust.passportNumber || '—'}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-100 dark:border-slate-800">
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-medium">
                            {cust.serviceCategory}
                          </span>
                        </td>
                        <td className="py-2 px-3 border-r border-slate-100 dark:border-slate-800">
                          {cust.destinationCountry}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-100 dark:border-slate-800 font-medium text-indigo-600 dark:text-indigo-400">
                          {cust.assignedAgent}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold border-r border-slate-100 dark:border-slate-800">
                          {formatCurrency(cFin.agreedFee, currency)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 border-r border-slate-100 dark:border-slate-800">
                          {formatCurrency(cFin.totalReceipts, currency)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-amber-700 dark:text-amber-400 border-r border-slate-100 dark:border-slate-800">
                          {formatCurrency(cFin.outstandingBalance, currency)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono border-r border-slate-100 dark:border-slate-800">
                          {formatCurrency(cFin.totalPaidToAgent, currency)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-500 border-r border-slate-100 dark:border-slate-800">
                          {formatCurrency(cFin.businessExpenses, currency)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-teal-700 dark:text-teal-300 border-r border-slate-100 dark:border-slate-800">
                          {formatCurrency(cFin.estimatedCommission, currency)}
                        </td>
                        <td className="py-2 px-3 text-center border-r border-slate-100 dark:border-slate-800">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            cust.documentsReceived === 'Yes' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {cust.documentsReceived}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center border-r border-slate-100 dark:border-slate-800">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            cust.documentsSentToAgent === 'Yes' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {cust.documentsSentToAgent}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center border-r border-slate-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
                          <select
                            aria-label={`Update case status for ${cust.fullName}`}
                            value={cust.caseStatus}
                            onChange={(e) => onUpdateCustomerStatus(cust.id, e.target.value as CaseStatus)}
                            className="bg-transparent border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-[11px] font-medium"
                          >
                            {CASE_STATUSES.map((st) => (
                              <option key={st} value={st} className="bg-slate-900 text-white">{st}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3 font-mono border-r border-slate-100 dark:border-slate-800">
                          {cust.nextFollowUpDate}
                        </td>
                        <td className="py-2 px-3 text-slate-400 border-r border-slate-100 dark:border-slate-800">
                          {cust.lastUpdated}
                        </td>
                        <td className="py-2 px-3 max-w-xs truncate text-slate-600 dark:text-slate-300" title={cust.notes}>
                          {cust.notes || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 2: CUSTOMER PAYMENT LEDGER (Z-AI) */}
        {(activeSubTab === 'ALL' || activeSubTab === 'LEDGER') && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-emerald-950 px-4 py-2.5 text-white flex items-center justify-between border-b border-emerald-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-200">
                  Customer Payment Ledger (Columns Z – AI)
                </span>
                <span className="text-[11px] text-emerald-300 font-normal">
                  ({filteredTransactions.length} Transactions)
                </span>
              </div>
              <span className="text-[11px] text-emerald-300">
                Safety Rule: No overwrite • Distinct receipt / refund / expenses
              </span>
            </div>

            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
                <thead className="bg-emerald-900/30 text-slate-700 dark:text-slate-300 sticky top-0 z-10 border-b border-emerald-800/40">
                  <tr className="uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-2.5 px-3">Z: Tx Date</th>
                    <th className="py-2.5 px-3">AA: Cust ID</th>
                    <th className="py-2.5 px-3">AB: Cust Name</th>
                    <th className="py-2.5 px-3">AC: Tx Type</th>
                    <th className="py-2.5 px-3 text-right">AD: Amount</th>
                    <th className="py-2.5 px-3">AE: Method</th>
                    <th className="py-2.5 px-3">AF: Ref / Receipt No</th>
                    <th className="py-2.5 px-3">AG: Service Line</th>
                    <th className="py-2.5 px-3">AH: Notes</th>
                    <th className="py-2.5 px-3">AI: Check / Warnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTransactions.map((tx) => {
                    const warning = checkCustomerPaymentLedgerWarning(tx, customers);

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2 px-3 font-mono text-slate-500">{tx.transactionDate}</td>
                        <td className="py-2 px-3 font-mono font-bold text-teal-600 dark:text-teal-400">
                          {tx.customerId}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                          {tx.customerName}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              tx.transactionType === 'Customer Receipt'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : tx.transactionType === 'Refund to Customer'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : tx.transactionType === 'Business Expense'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {tx.transactionType}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold">
                          {tx.transactionType === 'Refund to Customer' ? (
                            <span className="text-rose-600">−{formatCurrency(tx.amount, currency)}</span>
                          ) : (
                            formatCurrency(tx.amount, currency)
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{tx.paymentMethod}</td>
                        <td className="py-2 px-3 font-mono text-slate-500">{tx.referenceNumber || '—'}</td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{tx.serviceLine || 'Unassigned'}</td>
                        <td className="py-2 px-3 max-w-xs truncate text-slate-500">{tx.notes || '—'}</td>
                        <td className="py-2 px-3">
                          {warning ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded">
                              <AlertTriangle className="w-3 h-3" /> {warning}
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">OK</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
