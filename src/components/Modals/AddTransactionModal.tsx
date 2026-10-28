import React, { useState } from 'react';
import {
  Customer,
  AgentAssignment,
  CustomerPaymentTransaction,
  AgentPaymentTransaction,
  TransactionType,
  PaymentMethod,
  ServiceCategory,
} from '../../types';
import { PAYMENT_METHODS, SERVICE_CATEGORIES, COMMON_PAYMENT_PURPOSES } from '../../utils/initialData';
import { X, CreditCard, AlertTriangle, ShieldCheck, Check } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  agentAssignments: AgentAssignment[];
  onAddCustomerTransaction: (tx: CustomerPaymentTransaction) => void;
  onAddAgentTransaction: (tx: AgentPaymentTransaction) => void;
  defaultCustomerId?: string;
  defaultTransactionType?: 'CUSTOMER_RECEIPT' | 'CUSTOMER_REFUND' | 'BUSINESS_EXPENSE' | 'AGENT_PAYMENT';
  defaultAgentId?: string;
  defaultServiceLine?: ServiceCategory;
  defaultPurpose?: string;
  defaultAmount?: number;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  customers,
  agentAssignments,
  onAddCustomerTransaction,
  onAddAgentTransaction,
  defaultCustomerId,
  defaultTransactionType,
  defaultAgentId,
  defaultServiceLine,
  defaultPurpose,
  defaultAmount,
}) => {
  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  const [targetCategory, setTargetCategory] = useState<'CUSTOMER_RECEIPT' | 'CUSTOMER_REFUND' | 'BUSINESS_EXPENSE' | 'AGENT_PAYMENT'>(
    defaultTransactionType || 'CUSTOMER_RECEIPT'
  );

  const [customerId, setCustomerId] = useState(defaultCustomerId || customers[0]?.id || '');
  const [agentId, setAgentId] = useState(defaultAgentId || agentAssignments[0]?.agentId || 'AGENT-0001');
  const [purpose, setPurpose] = useState<string>(defaultPurpose || 'Biometrics Fee / Appointment');
  const [amount, setAmount] = useState<number>(defaultAmount !== undefined ? defaultAmount : 20000);
  const [paymentDate, setPaymentDate] = useState(today);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [serviceLine, setServiceLine] = useState<ServiceCategory>(defaultServiceLine || 'Visa');
  const [notes, setNotes] = useState('');

  const selectedCust = customers.find((c) => c.id === customerId);

  // Auto-set serviceLine if customer is selected
  const handleCustomerChange = (id: string) => {
    setCustomerId(id);
    const found = customers.find((c) => c.id === id);
    if (found) {
      setServiceLine(found.serviceCategory);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    if (targetCategory === 'AGENT_PAYMENT') {
      const newAgentTx: AgentPaymentTransaction = {
        id: `APTX-${Date.now().toString().slice(-4)}`,
        paymentDate,
        agentId,
        customerId,
        purpose: purpose.trim() || 'General Processing',
        serviceLine,
        amount: Number(amount),
        paymentMethod,
        referenceNumber: referenceNumber.trim() || `REF-${Math.floor(Math.random() * 90000 + 10000)}`,
        notes: notes.trim(),
      };
      onAddAgentTransaction(newAgentTx);
    } else {
      let txType: TransactionType = 'Customer Receipt';
      if (targetCategory === 'CUSTOMER_REFUND') txType = 'Refund to Customer';
      if (targetCategory === 'BUSINESS_EXPENSE') txType = 'Business Expense';

      const newCustTx: CustomerPaymentTransaction = {
        id: `CTX-${Date.now().toString().slice(-4)}`,
        transactionDate: paymentDate,
        customerId,
        customerName: selectedCust ? selectedCust.fullName : 'Customer',
        transactionType: txType,
        amount: Number(amount),
        paymentMethod,
        referenceNumber: referenceNumber.trim() || `REF-${Math.floor(Math.random() * 90000 + 10000)}`,
        serviceLine,
        notes: notes.trim(),
      };
      onAddCustomerTransaction(newCustTx);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden my-8">
        <div className="bg-[#0B1F3A] px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-base">Record Payment / Transaction (پیمنٹ کا اندراج)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Target Transaction Category Selection */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
              Select Transaction Category (لین دین کی قسم):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setTargetCategory('CUSTOMER_RECEIPT')}
                className={`p-2 rounded-lg text-center font-semibold border transition ${
                  targetCategory === 'CUSTOMER_RECEIPT'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Customer Receipt (وصولی)
              </button>

              <button
                type="button"
                onClick={() => setTargetCategory('CUSTOMER_REFUND')}
                className={`p-2 rounded-lg text-center font-semibold border transition ${
                  targetCategory === 'CUSTOMER_REFUND'
                    ? 'bg-rose-600 text-white border-rose-500 shadow'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Customer Refund (واپسی)
              </button>

              <button
                type="button"
                onClick={() => setTargetCategory('AGENT_PAYMENT')}
                className={`p-2 rounded-lg text-center font-semibold border transition ${
                  targetCategory === 'AGENT_PAYMENT'
                    ? 'bg-purple-600 text-white border-purple-500 shadow'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Payment to Agent (ایجنٹ کو)
              </button>

              <button
                type="button"
                onClick={() => setTargetCategory('BUSINESS_EXPENSE')}
                className={`p-2 rounded-lg text-center font-semibold border transition ${
                  targetCategory === 'BUSINESS_EXPENSE'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Business Expense (خرچہ)
              </button>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-center gap-2 text-slate-700 dark:text-slate-300 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>
              {targetCategory === 'AGENT_PAYMENT'
                ? 'Ye payment seedha AGENT REGISTER ledger mein darj hogi taake double-counting na ho.'
                : 'Ye payment CUSTOMER REGISTER ledger mein nayi row ke tor par darj hogi. Purani entries overwrite nahi hongi.'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Customer *
              </label>
              <select
                required
                value={customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.fullName} ({c.destinationCountry})
                  </option>
                ))}
              </select>
            </div>

            {targetCategory === 'AGENT_PAYMENT' && (
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Agent ID & Name *
                </label>
                <select
                  required
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                >
                  {agentAssignments.map((a, i) => (
                    <option key={`${a.agentId}-${i}`} value={a.agentId}>
                      {a.agentId} — {a.agentName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {targetCategory === 'AGENT_PAYMENT' && (
              <div className="sm:col-span-2">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Payment Purpose / Maqsad * (کس مقصد کے لیے ایجنٹ کو رقم دی جا رہی ہے — مثلاً Biometrics)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {COMMON_PAYMENT_PURPOSES.map((cp) => (
                    <button
                      key={cp}
                      type="button"
                      onClick={() => setPurpose(cp)}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition cursor-pointer ${
                        purpose === cp
                          ? 'bg-purple-600 text-white border-purple-500 font-bold shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400'
                      }`}
                    >
                      {cp}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Biometrics Fee, Visa Stamping, GAMCA Medical..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-medium"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Transaction Date *
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Amount (PKR) * (رقم)
              </label>
              <input
                type="number"
                required
                min={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono font-bold text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Receipt / Reference Number (رسید نمبر)
              </label>
              <input
                type="text"
                placeholder="e.g. HBL-98124 / CASH-021"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono"
              />
            </div>

            {targetCategory !== 'AGENT_PAYMENT' && (
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Service Line Breakdown
                </label>
                <select
                  value={serviceLine}
                  onChange={(e) => setServiceLine(e.target.value as ServiceCategory)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                >
                  {SERVICE_CATEGORIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Transaction Notes
            </label>
            <input
              type="text"
              placeholder="e.g. 1st installment, VFS fee deposit, embassy challan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold flex items-center gap-1.5 shadow"
            >
              <Check className="w-4 h-4" /> Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
