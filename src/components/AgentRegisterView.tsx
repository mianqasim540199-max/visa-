import React, { useState } from 'react';
import {
  AgentAssignment,
  AgentPaymentTransaction,
  AgentWorkStatus,
  CurrencyCode,
  Customer,
} from '../types';
import { checkAgentPaymentLedgerWarning } from '../utils/calculations';
import { formatCurrency, AGENT_WORK_STATUSES } from '../utils/initialData';
import {
  Users,
  CreditCard,
  Plus,
  AlertTriangle,
  CheckCircle,
  Building2,
  Calendar,
  Briefcase,
  Search,
} from 'lucide-react';

interface AgentRegisterViewProps {
  agentAssignments: AgentAssignment[];
  agentTransactions: AgentPaymentTransaction[];
  customers: Customer[];
  currency: CurrencyCode;
  onOpenAddAgent: () => void;
  onOpenAddTransaction: () => void;
  onUpdateAgentWorkStatus: (agentId: string, customerId: string, status: AgentWorkStatus) => void;
}

export const AgentRegisterView: React.FC<AgentRegisterViewProps> = ({
  agentAssignments,
  agentTransactions,
  customers,
  currency,
  onOpenAddAgent,
  onOpenAddTransaction,
  onUpdateAgentWorkStatus,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ALL' | 'ASSIGNMENTS' | 'LEDGER'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filtered assignments
  const filteredAssignments = agentAssignments.filter((asgn) => {
    const matchesSearch =
      asgn.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asgn.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asgn.agentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asgn.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asgn.serviceCategory.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || asgn.agentWorkStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filtered agent transactions
  const filteredAgentTransactions = agentTransactions.filter((tx) => {
    return (
      tx.agentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.notes.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-4">
      {/* Worksheet Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 px-2 py-0.5 rounded">
                Worksheet 2
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                AGENT REGISTER & AUTHORITATIVE PAYMENT LEDGER
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Columns A–T: Agent Assignments • Columns V–AC: Authoritative Agent Payment Ledger
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
                onClick={() => setActiveSubTab('ASSIGNMENTS')}
                className={`px-2.5 py-1.5 rounded-md transition ${
                  activeSubTab === 'ASSIGNMENTS'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Assignments (A-T)
              </button>
              <button
                onClick={() => setActiveSubTab('LEDGER')}
                className={`px-2.5 py-1.5 rounded-md transition ${
                  activeSubTab === 'LEDGER'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Agent Ledger (V-AC)
              </button>
            </div>

            <button
              onClick={onOpenAddAgent}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Assign Agent
            </button>
            <button
              onClick={onOpenAddTransaction}
              className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Pay Agent
            </button>
          </div>
        </div>

        {/* Accounting Rule Banner */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-teal-500" />
            <span>
              <strong>Authoritative Rule:</strong> Agent payments ka asal source yehi register hai. Yahan se Customer Register ka column P aur Dashboard ka profit nikalta hai.
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            Total Payments: {agentTransactions.length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Agent Name, Customer Name, Agent ID, Service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="filter-work-status" className="text-slate-500 font-medium">Work Status:</label>
          <select
            id="filter-work-status"
            aria-label="Filter by Agent Work Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Statuses</option>
            {AGENT_WORK_STATUSES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tables Area */}
      <div className="space-y-6">
        {/* SECTION 1: AGENT ASSIGNMENT TABLE (A-T) */}
        {(activeSubTab === 'ALL' || activeSubTab === 'ASSIGNMENTS') && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-[#0B1F3A] px-4 py-2.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-400" />
                <span className="font-bold text-xs uppercase tracking-wider">
                  Agent Assignments Table (Columns A – T)
                </span>
                <span className="text-[11px] text-teal-300 font-normal">
                  ({filteredAssignments.length} Assignments)
                </span>
              </div>
              <span className="text-[11px] text-slate-300">
                1 Agent → Multiple Customers • 1 Customer → Multiple Payments
              </span>
            </div>

            <div className="overflow-x-auto max-h-[480px]">
              <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 sticky top-0 z-10 shadow-sm border-b border-slate-200 dark:border-slate-700">
                  <tr className="uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">A: Agent ID</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">B: Agent / Company</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">C: Phone</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">D: WhatsApp</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">E: Email</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">F: Address</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">G: Cust ID</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">H: Cust Name</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">I: Service</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-200 dark:border-slate-700">J: Agreed Cost</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400">K: Total Paid</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400">L: Remaining</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">M: Last Paid Date</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">N: Method</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">O: Ref No</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-200 dark:border-slate-700">P: Docs Sent</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-200 dark:border-slate-700">Q: Docs Ret</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-200 dark:border-slate-700">R: Work Status</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">S: Expected Date</th>
                    <th className="py-2.5 px-3">T: Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAssignments.map((asgn, idx) => {
                    const paidToThisAgent = agentTransactions
                      .filter((t) => t.agentId === asgn.agentId && t.customerId === asgn.customerId)
                      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

                    const remaining = Math.max(0, (Number(asgn.agreedAgentCost) || 0) - paidToThisAgent);

                    const relevantTxs = agentTransactions.filter(
                      (t) => t.agentId === asgn.agentId && t.customerId === asgn.customerId
                    );
                    const lastTx = relevantTxs[relevantTxs.length - 1];

                    return (
                      <tr key={`${asgn.agentId}-${asgn.customerId}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                        <td className="py-2 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 border-r border-slate-100 dark:border-slate-800">
                          {asgn.agentId}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white border-r border-slate-100 dark:border-slate-800">
                          {asgn.agentName}
                        </td>
                        <td className="py-2 px-3 font-mono border-r border-slate-100 dark:border-slate-800">{asgn.phone}</td>
                        <td className="py-2 px-3 font-mono border-r border-slate-100 dark:border-slate-800">{asgn.whatsapp}</td>
                        <td className="py-2 px-3 text-slate-500 border-r border-slate-100 dark:border-slate-800">{asgn.email}</td>
                        <td className="py-2 px-3 max-w-xs truncate border-r border-slate-100 dark:border-slate-800">{asgn.cityAddress}</td>
                        <td className="py-2 px-3 font-mono font-bold text-teal-600 dark:text-teal-400 border-r border-slate-100 dark:border-slate-800">
                          {asgn.customerId}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800">
                          {asgn.customerName}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-100 dark:border-slate-800">
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                            {asgn.serviceCategory}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold border-r border-slate-100 dark:border-slate-800">
                          {formatCurrency(asgn.agreedAgentCost, currency)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400 border-r border-slate-100 dark:border-slate-800">
                          {formatCurrency(paidToThisAgent, currency)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-amber-700 dark:text-amber-400 border-r border-slate-100 dark:border-slate-800">
                          {formatCurrency(remaining, currency)}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-500 border-r border-slate-100 dark:border-slate-800">
                          {lastTx ? lastTx.paymentDate : '—'}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-100 dark:border-slate-800">
                          {lastTx ? lastTx.paymentMethod : '—'}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-500 border-r border-slate-100 dark:border-slate-800">
                          {lastTx ? lastTx.referenceNumber : '—'}
                        </td>
                        <td className="py-2 px-3 text-center border-r border-slate-100 dark:border-slate-800">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            asgn.documentsSent === 'Yes' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {asgn.documentsSent}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center border-r border-slate-100 dark:border-slate-800">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            asgn.documentsReceived === 'Yes' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {asgn.documentsReceived}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center border-r border-slate-100 dark:border-slate-800">
                          <select
                            aria-label={`Update work status for ${asgn.agentName} handling ${asgn.customerName}`}
                            value={asgn.agentWorkStatus}
                            onChange={(e) =>
                              onUpdateAgentWorkStatus(
                                asgn.agentId,
                                asgn.customerId,
                                e.target.value as AgentWorkStatus
                              )
                            }
                            className="bg-transparent border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-[11px] font-medium"
                          >
                            {AGENT_WORK_STATUSES.map((st) => (
                              <option key={st} value={st} className="bg-slate-900 text-white">{st}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3 font-mono border-r border-slate-100 dark:border-slate-800">
                          {asgn.expectedCompletionDate}
                        </td>
                        <td className="py-2 px-3 max-w-xs truncate text-slate-500" title={asgn.notes}>
                          {asgn.notes || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 2: AGENT PAYMENT LEDGER (V-AC) */}
        {(activeSubTab === 'ALL' || activeSubTab === 'LEDGER') && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-purple-950 px-4 py-2.5 text-white flex items-center justify-between border-b border-purple-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-purple-200">
                  Agent Payment Ledger (Columns V – AC)
                </span>
                <span className="text-[11px] text-purple-300 font-normal">
                  ({filteredAgentTransactions.length} Payments Made)
                </span>
              </div>
              <span className="text-[11px] text-purple-300">
                Authoritative source for all agent payments & profit calculations
              </span>
            </div>

            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
                <thead className="bg-purple-900/30 text-slate-700 dark:text-slate-300 sticky top-0 z-10 border-b border-purple-800/40">
                  <tr className="uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-2.5 px-3">V: Payment Date</th>
                    <th className="py-2.5 px-3">W: Agent ID</th>
                    <th className="py-2.5 px-3">X: Customer ID</th>
                    <th className="py-2.5 px-3">Payment Purpose / Maqsad (کس مقصد کے لیے)</th>
                    <th className="py-2.5 px-3 text-right">Y: Amount (PKR)</th>
                    <th className="py-2.5 px-3">Z: Payment Method</th>
                    <th className="py-2.5 px-3">AA: Receipt / Ref No</th>
                    <th className="py-2.5 px-3">AB: Notes</th>
                    <th className="py-2.5 px-3">AC: Check / Warning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAgentTransactions.map((tx) => {
                    const warning = checkAgentPaymentLedgerWarning(tx, agentAssignments);

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2 px-3 font-mono text-slate-500">{tx.paymentDate}</td>
                        <td className="py-2 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {tx.agentId}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-teal-600 dark:text-teal-400">
                          {tx.customerId}
                        </td>
                        <td className="py-2 px-3">
                          <span className="inline-flex items-center gap-1 font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800 text-[11px]">
                            🎯 {tx.purpose || 'General Case Processing'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-purple-700 dark:text-purple-300">
                          {formatCurrency(tx.amount, currency)}
                        </td>
                        <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{tx.paymentMethod}</td>
                        <td className="py-2 px-3 font-mono text-slate-500">{tx.referenceNumber || '—'}</td>
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
