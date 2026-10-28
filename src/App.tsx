/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Customer,
  CustomerPaymentTransaction,
  AgentAssignment,
  AgentPaymentTransaction,
  CurrencyCode,
  UserRole,
  CaseStatus,
  AgentWorkStatus,
  ServiceCategory,
} from './types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_CUSTOMER_TRANSACTIONS,
  INITIAL_AGENT_ASSIGNMENTS,
  INITIAL_AGENT_PAYMENTS,
} from './utils/initialData';
import { downloadWorkbookFile } from './utils/excelExport';
import { Navbar } from './components/Navbar';
import { InstructionSection } from './components/InstructionSection';
import { DashboardView } from './components/DashboardView';
import { CustomerRegisterView } from './components/CustomerRegisterView';
import { AgentRegisterView } from './components/AgentRegisterView';
import { AddCustomerModal } from './components/Modals/AddCustomerModal';
import { AddTransactionModal } from './components/Modals/AddTransactionModal';
import { AddAgentModal } from './components/Modals/AddAgentModal';
import { ReceiptModal } from './components/Modals/ReceiptModal';
import { GoogleSheetsModal } from './components/Modals/GoogleSheetsModal';
import { initAuth } from './services/googleAuth';
import { User as FirebaseUser } from 'firebase/auth';
import { Download, FileSpreadsheet, ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react';

export default function App() {
  // Navigation: Default opening sheet is FINAL REPORT DASHBOARD
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'CUSTOMER_REGISTER' | 'AGENT_REGISTER'>('DASHBOARD');

  // Persistence in LocalStorage
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('cams_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [customerTransactions, setCustomerTransactions] = useState<CustomerPaymentTransaction[]>(() => {
    const saved = localStorage.getItem('cams_cust_tx');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMER_TRANSACTIONS;
  });

  const [agentAssignments, setAgentAssignments] = useState<AgentAssignment[]>(() => {
    const saved = localStorage.getItem('cams_agent_asgn');
    return saved ? JSON.parse(saved) : INITIAL_AGENT_ASSIGNMENTS;
  });

  const [agentTransactions, setAgentTransactions] = useState<AgentPaymentTransaction[]>(() => {
    const saved = localStorage.getItem('cams_agent_tx');
    return saved ? JSON.parse(saved) : INITIAL_AGENT_PAYMENTS;
  });

  // Global settings
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('CUST-0001');
  const [currency, setCurrency] = useState<CurrencyCode>('PKR');
  const [role, setRole] = useState<UserRole>('Admin');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('cams_theme') === 'dark';
  });

  // Google Workspace auth & modal state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState(false);

  // Modal visibility
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Defaults for AddTransactionModal when opened from an agent assignment
  const [transactionModalDefaults, setTransactionModalDefaults] = useState<{
    transactionType?: 'CUSTOMER_RECEIPT' | 'CUSTOMER_REFUND' | 'BUSINESS_EXPENSE' | 'AGENT_PAYMENT';
    customerId?: string;
    agentId?: string;
    serviceLine?: ServiceCategory;
    purpose?: string;
    amount?: number;
  } | null>(null);

  const handleOpenAddTransaction = (defaults?: {
    transactionType?: 'CUSTOMER_RECEIPT' | 'CUSTOMER_REFUND' | 'BUSINESS_EXPENSE' | 'AGENT_PAYMENT';
    customerId?: string;
    agentId?: string;
    serviceLine?: ServiceCategory;
    purpose?: string;
    amount?: number;
  }) => {
    setTransactionModalDefaults(defaults || null);
    setIsAddTransactionOpen(true);
  };

  // Initialize Firebase Auth listener for Google account
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => setCurrentUser(user),
      () => setCurrentUser(null)
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('cams_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('cams_cust_tx', JSON.stringify(customerTransactions));
  }, [customerTransactions]);

  useEffect(() => {
    localStorage.setItem('cams_agent_asgn', JSON.stringify(agentAssignments));
  }, [agentAssignments]);

  useEffect(() => {
    localStorage.setItem('cams_agent_tx', JSON.stringify(agentTransactions));
  }, [agentTransactions]);

  useEffect(() => {
    localStorage.setItem('cams_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handlers
  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers((prev) => [...prev, newCustomer]);
    setSelectedCustomerId(newCustomer.id);
  };

  const handleAddCustomerTransaction = (newTx: CustomerPaymentTransaction) => {
    setCustomerTransactions((prev) => [...prev, newTx]);
  };

  const handleAddAgentTransaction = (newTx: AgentPaymentTransaction) => {
    setAgentTransactions((prev) => [...prev, newTx]);
  };

  const handleAddAgentAssignment = (newAsgn: AgentAssignment) => {
    setAgentAssignments((prev) => [...prev, newAsgn]);
  };

  const handleUpdateCustomerStatus = (id: string, status: CaseStatus) => {
    const today = new Date().toISOString().split('T')[0];
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, caseStatus: status, lastUpdated: today } : c))
    );
  };

  const handleUpdateAgentWorkStatus = (
    agentId: string,
    customerId: string,
    status: AgentWorkStatus
  ) => {
    setAgentAssignments((prev) =>
      prev.map((a) =>
        a.agentId === agentId && a.customerId === customerId ? { ...a, agentWorkStatus: status } : a
      )
    );
  };

  const handleExportExcel = () => {
    downloadWorkbookFile(
      customers,
      customerTransactions,
      agentAssignments,
      agentTransactions,
      selectedCustomerId
    );
  };

  const handleResetToSeedData = () => {
    if (window.confirm('Reset all records to initial default demo data?')) {
      setCustomers(INITIAL_CUSTOMERS);
      setCustomerTransactions(INITIAL_CUSTOMER_TRANSACTIONS);
      setAgentAssignments(INITIAL_AGENT_ASSIGNMENTS);
      setAgentTransactions(INITIAL_AGENT_PAYMENTS);
      setSelectedCustomerId('CUST-0001');
    }
  };

  // Distinct agent names for dropdowns
  const availableAgentNames = Array.from(new Set(agentAssignments.map((a) => a.agentName)));

  const selectedCustomerObj =
    customers.find((c) => c.id === selectedCustomerId) || customers[0] || null;

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Top App Bar with Tab Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        role={role}
        setRole={setRole}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        currentUser={currentUser}
        onOpenGoogleSheets={() => setIsGoogleSheetsModalOpen(true)}
        onOpenAddCustomer={() => setIsAddCustomerOpen(true)}
        onOpenAddTransaction={() => setIsAddTransactionOpen(true)}
        onOpenAddAgent={() => setIsAddAgentOpen(true)}
        onOpenReceipt={() => setIsReceiptOpen(true)}
        onExportExcel={handleExportExcel}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 space-y-6">
        {/* Step-by-Step System Blueprint & Accounting Rules Box */}
        <InstructionSection />

        {/* Dynamic Sheet Views */}
        {activeTab === 'DASHBOARD' && (
          <DashboardView
            customers={customers}
            customerTransactions={customerTransactions}
            agentAssignments={agentAssignments}
            agentTransactions={agentTransactions}
            selectedCustomerId={selectedCustomerId}
            setSelectedCustomerId={setSelectedCustomerId}
            currency={currency}
            onOpenReceipt={() => setIsReceiptOpen(true)}
            onOpenAddTransaction={handleOpenAddTransaction}
            onOpenAddCustomer={() => setIsAddCustomerOpen(true)}
            onOpenAddAgent={() => setIsAddAgentOpen(true)}
          />
        )}

        {activeTab === 'CUSTOMER_REGISTER' && (
          <CustomerRegisterView
            customers={customers}
            customerTransactions={customerTransactions}
            agentAssignments={agentAssignments}
            agentTransactions={agentTransactions}
            currency={currency}
            onOpenAddCustomer={() => setIsAddCustomerOpen(true)}
            onOpenAddTransaction={() => setIsAddTransactionOpen(true)}
            onSelectCustomer={(id) => {
              setSelectedCustomerId(id);
              setActiveTab('DASHBOARD');
            }}
            onUpdateCustomerStatus={handleUpdateCustomerStatus}
          />
        )}

        {activeTab === 'AGENT_REGISTER' && (
          <AgentRegisterView
            agentAssignments={agentAssignments}
            agentTransactions={agentTransactions}
            customers={customers}
            currency={currency}
            onOpenAddAgent={() => setIsAddAgentOpen(true)}
            onOpenAddTransaction={() => setIsAddTransactionOpen(true)}
            onUpdateAgentWorkStatus={handleUpdateAgentWorkStatus}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Customer & Agent Management System
            </span>
            <span>• Visa, Immigration, Medical, Biometrics, Protector & Ticketing</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportExcel}
              className="hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1 font-medium"
            >
              <Download className="w-3.5 h-3.5" /> Download .xlsx (3 Worksheets)
            </button>
            <span>•</span>
            <button
              onClick={handleResetToSeedData}
              className="hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Demo Data
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onAddCustomer={handleAddCustomer}
        existingCustomersCount={customers.length}
        availableAgents={availableAgentNames}
      />

      <AddTransactionModal
        key={transactionModalDefaults ? JSON.stringify(transactionModalDefaults) : 'default'}
        isOpen={isAddTransactionOpen}
        onClose={() => {
          setIsAddTransactionOpen(false);
          setTransactionModalDefaults(null);
        }}
        customers={customers}
        agentAssignments={agentAssignments}
        onAddCustomerTransaction={handleAddCustomerTransaction}
        onAddAgentTransaction={handleAddAgentTransaction}
        defaultCustomerId={transactionModalDefaults?.customerId || selectedCustomerId}
        defaultTransactionType={transactionModalDefaults?.transactionType}
        defaultAgentId={transactionModalDefaults?.agentId}
        defaultServiceLine={transactionModalDefaults?.serviceLine}
        defaultPurpose={transactionModalDefaults?.purpose}
        defaultAmount={transactionModalDefaults?.amount}
      />

      <AddAgentModal
        isOpen={isAddAgentOpen}
        onClose={() => setIsAddAgentOpen(false)}
        customers={customers}
        existingAssignments={agentAssignments}
        onAddAssignment={handleAddAgentAssignment}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        customer={selectedCustomerObj}
        transactions={customerTransactions}
        agentTransactions={agentTransactions}
        currency={currency}
      />

      <GoogleSheetsModal
        isOpen={isGoogleSheetsModalOpen}
        onClose={() => setIsGoogleSheetsModalOpen(false)}
        customers={customers}
        customerTransactions={customerTransactions}
        agentAssignments={agentAssignments}
        agentTransactions={agentTransactions}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        onExportLocalExcel={handleExportExcel}
      />
    </div>
  );
}
