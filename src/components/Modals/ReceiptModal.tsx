import React from 'react';
import { Customer, CustomerPaymentTransaction, AgentPaymentTransaction, CurrencyCode } from '../../types';
import { formatCurrency } from '../../utils/initialData';
import { X, Printer, CheckCircle, ShieldCheck, Briefcase } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  transactions: CustomerPaymentTransaction[];
  agentTransactions?: AgentPaymentTransaction[];
  currency: CurrencyCode;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  customer,
  transactions,
  agentTransactions = [],
  currency,
}) => {
  if (!isOpen || !customer) return null;

  const custReceipts = transactions.filter((tx) => tx.customerId === customer.id);
  const custAgentPayments = agentTransactions.filter((tx) => tx.customerId === customer.id);
  const totalPaidToAgent = custAgentPayments.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  const totalReceived = custReceipts
    .filter((tx) => tx.transactionType === 'Customer Receipt')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  const totalRefunds = custReceipts
    .filter((tx) => tx.transactionType === 'Refund to Customer')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  const netPaid = totalReceived - totalRefunds;
  const agreedFee = Number(customer.agreedFee) || 0;
  const outstanding = Math.max(0, agreedFee - netPaid);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6 text-slate-800">
        {/* Modal Top Bar - Hidden in Print */}
        <div className="no-print bg-[#0B1F3A] px-5 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-teal-400" />
            <h3 className="font-bold text-sm">Official Customer Statement & Payment Receipt</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition"
            >
              <Printer className="w-3.5 h-3.5" /> Print Receipt
            </button>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                VISA & IMMIGRATION DOCUMENT PROCESSING
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Customer & Agent Management System • Official Statement
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Lahore • Rawalpindi • Islamabad • Karachi
              </p>
            </div>
            <div className="text-right">
              <span className="font-mono text-sm font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded">
                {customer.id}
              </span>
              <p className="text-xs text-slate-500 mt-1">Date: {new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>

          {/* Customer & Case Details */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[11px]">Customer Full Name</span>
              <strong className="text-sm text-slate-900">{customer.fullName}</strong>
              <div className="mt-1 text-slate-600">
                <span>Phone: {customer.phone}</span>
                {customer.whatsapp && <span className="ml-2">• WA: {customer.whatsapp}</span>}
              </div>
              <div className="text-slate-600 truncate">{customer.fullAddress || customer.city}</div>
            </div>

            <div className="text-right">
              <span className="text-slate-500 block text-[11px]">Service & Destination</span>
              <strong className="text-sm text-teal-800">
                {customer.serviceCategory} — {customer.destinationCountry}
              </strong>
              <div className="mt-1 text-slate-600">
                Passport: <span className="font-mono font-semibold">{customer.passportNumber || 'N/A'}</span>
              </div>
              <div className="text-slate-600">
                Case Status: <span className="font-semibold text-slate-900">{customer.caseStatus}</span>
              </div>
            </div>
          </div>

          {/* Payment Transactions Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Payment Transactions History
            </h4>
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Receipt / Ref #</th>
                  <th className="py-2 px-3">Transaction Type</th>
                  <th className="py-2 px-3">Payment Method</th>
                  <th className="py-2 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {custReceipts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400">
                      No payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  custReceipts.map((tx) => (
                    <tr key={tx.id}>
                      <td className="py-2 px-3 font-mono text-slate-600">{tx.transactionDate}</td>
                      <td className="py-2 px-3 font-mono">{tx.referenceNumber || '—'}</td>
                      <td className="py-2 px-3 font-medium">
                        <span className={tx.transactionType === 'Refund to Customer' ? 'text-rose-600' : 'text-slate-800'}>
                          {tx.transactionType}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600">{tx.paymentMethod}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">
                        {tx.transactionType === 'Refund to Customer' ? `−` : ''}
                        {formatCurrency(tx.amount, currency)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Agent Processing Disbursements (Purpose Breakdown) */}
          {custAgentPayments.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                  Agent Processing Disbursements (ایجنٹ کو دی گئی رقم برائے بائیومیٹرک/ویزہ)
                </h4>
                <span className="text-xs font-mono font-bold text-purple-700">
                  Total: {formatCurrency(totalPaidToAgent, currency)}
                </span>
              </div>
              <table className="w-full text-xs text-left border-collapse border border-purple-200 bg-purple-50/30">
                <thead>
                  <tr className="bg-purple-100 text-purple-900 font-semibold border-b border-purple-200 text-[11px]">
                    <th className="py-1.5 px-3">Date</th>
                    <th className="py-1.5 px-3">Agent</th>
                    <th className="py-1.5 px-3">Disbursement Purpose (کس مقصد کے لیے)</th>
                    <th className="py-1.5 px-3">Method</th>
                    <th className="py-1.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {custAgentPayments.map((atx) => (
                    <tr key={atx.id}>
                      <td className="py-1.5 px-3 font-mono text-slate-600">{atx.paymentDate}</td>
                      <td className="py-1.5 px-3 font-semibold text-slate-800">{atx.agentId}</td>
                      <td className="py-1.5 px-3 font-bold text-purple-800">
                        🎯 {atx.purpose || 'General Case Processing'}
                      </td>
                      <td className="py-1.5 px-3 text-slate-600">{atx.paymentMethod}</td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-purple-700">
                        {formatCurrency(atx.amount, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary Box */}
          <div className="bg-slate-100 p-4 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-700">
              <span>Agreed Total Customer Fee:</span>
              <span className="font-mono font-bold text-sm">{formatCurrency(agreedFee, currency)}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-700">
              <span>Total Net Payments Received:</span>
              <span className="font-mono font-bold text-sm">{formatCurrency(netPaid, currency)}</span>
            </div>
            <div className="border-t border-slate-300 pt-2 flex justify-between items-center text-sm font-black">
              <span className="text-slate-900">Remaining Balance (Abhi Lene Hain):</span>
              <span className={outstanding > 0 ? 'text-amber-700 font-mono' : 'text-emerald-700 font-mono'}>
                {outstanding > 0 ? formatCurrency(outstanding, currency) : 'NIL (FULLY CLEARED)'}
              </span>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-center border-t border-slate-200">
            <div>
              <div className="border-b border-slate-400 pb-8 mb-1"></div>
              <span className="font-semibold text-slate-700">Customer Signature</span>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-8 mb-1"></div>
              <span className="font-semibold text-slate-700">Authorized Officer / Accounts Seal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
