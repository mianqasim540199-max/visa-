import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  PlusCircle,
  CreditCard,
  UserPlus,
  Moon,
  Sun,
  Shield,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import { CurrencyCode, UserRole } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  activeTab: 'DASHBOARD' | 'CUSTOMER_REGISTER' | 'AGENT_REGISTER';
  setActiveTab: (tab: 'DASHBOARD' | 'CUSTOMER_REGISTER' | 'AGENT_REGISTER') => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  role: UserRole;
  setRole: (r: UserRole) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  currentUser: FirebaseUser | null;
  onOpenGoogleSheets: () => void;
  onOpenAddCustomer: () => void;
  onOpenAddTransaction: () => void;
  onOpenAddAgent: () => void;
  onOpenReceipt: () => void;
  onExportExcel: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  role,
  setRole,
  isDarkMode,
  setIsDarkMode,
  currentUser,
  onOpenGoogleSheets,
  onOpenAddCustomer,
  onOpenAddTransaction,
  onOpenAddAgent,
  onOpenReceipt,
  onExportExcel,
}) => {
  return (
    <header className="no-print bg-[#0B1F3A] text-white border-b border-slate-700 shadow-md sticky top-0 z-40">
      {/* Top Banner with Brand and Global Actions */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-400 shadow-inner">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg tracking-tight text-white">
                Customer & Agent Management System
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-teal-400" /> Accounting Safe
              </span>
            </div>
            <p className="text-xs text-slate-300 hidden md:block">
              Visa • Immigration • Medical • Biometrics • Protector • Ticketing • Attestation
            </p>
          </div>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Currency Toggle */}
          <div className="flex items-center bg-slate-800/80 rounded-lg border border-slate-700 p-0.5 text-xs">
            <Coins className="w-3.5 h-3.5 text-amber-400 ml-1.5 mr-1" />
            {(['PKR', 'SAR', 'AED', 'USD'] as CurrencyCode[]).map((cur) => (
              <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  currency === cur
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title={`Switch display currency to ${cur}`}
              >
                {cur}
              </button>
            ))}
          </div>

          {/* Role Selector */}
          <div className="flex items-center bg-slate-800/80 rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300">
            <Shield className="w-3.5 h-3.5 text-teal-400 mr-1.5" />
            <select
              aria-label="User role switch"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="Admin" className="bg-slate-900 text-white">Admin (Full Access)</option>
              <option value="Accountant" className="bg-slate-900 text-white">Accountant</option>
              <option value="Agent" className="bg-slate-900 text-white">Agent / Operator</option>
              <option value="Viewer" className="bg-slate-900 text-white">Viewer (Read-Only)</option>
            </select>
          </div>

          {/* Quick Action Buttons */}
          {role !== 'Viewer' && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenAddCustomer}
                className="inline-flex items-center gap-1 bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Customer</span>
              </button>
              <button
                onClick={onOpenAddTransaction}
                className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow transition"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Record Payment</span>
              </button>
              <button
                onClick={onOpenAddAgent}
                className="hidden lg:inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Assign Agent</span>
              </button>
            </div>
          )}

          {/* Print Receipt / Invoice */}
          <button
            onClick={onOpenReceipt}
            title="Print Official Payment Receipt / Statement"
            className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Receipt</span>
          </button>

          {/* Google Sheets Live Integration */}
          <button
            onClick={onOpenGoogleSheets}
            title="Create and open live Google Sheet in Google Drive"
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-emerald-400/40 shadow transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
            <span>Google Sheet</span>
            {currentUser && (
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" title="Google account connected" />
            )}
          </button>

          {/* Export Real Excel .xlsx */}
          <button
            onClick={onExportExcel}
            title="Download authentic Microsoft Excel (.xlsx) file with 3 worksheets"
            className="inline-flex items-center gap-1 bg-gradient-to-r from-teal-700 to-slate-700 hover:from-teal-600 hover:to-slate-600 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg border border-teal-500/30 shadow transition"
          >
            <Download className="w-3.5 h-3.5 text-teal-300" />
            <span className="font-semibold">Export .xlsx</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Toggle Dark Mode"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-300" />}
          </button>
        </div>
      </div>

      {/* Worksheet Tabs Navigation — Exactly 3 Sheets */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center space-x-1 sm:space-x-2 border-t border-slate-800 pt-1">
        <button
          onClick={() => setActiveTab('DASHBOARD')}
          className={`flex items-center gap-2 py-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'DASHBOARD'
              ? 'border-teal-400 text-teal-300 bg-slate-800/60 rounded-t-md'
              : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/30 rounded-t-md'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold flex items-center justify-center">
            3
          </span>
          FINAL REPORT DASHBOARD
          <span className="text-[10px] bg-teal-900/60 text-teal-300 px-1.5 py-0.2 rounded border border-teal-700/50">
            Main View
          </span>
        </button>

        <button
          onClick={() => setActiveTab('CUSTOMER_REGISTER')}
          className={`flex items-center gap-2 py-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'CUSTOMER_REGISTER'
              ? 'border-teal-400 text-teal-300 bg-slate-800/60 rounded-t-md'
              : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/30 rounded-t-md'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold flex items-center justify-center">
            1
          </span>
          CUSTOMER REGISTER & LEDGER
        </button>

        <button
          onClick={() => setActiveTab('AGENT_REGISTER')}
          className={`flex items-center gap-2 py-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'AGENT_REGISTER'
              ? 'border-teal-400 text-teal-300 bg-slate-800/60 rounded-t-md'
              : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/30 rounded-t-md'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold flex items-center justify-center">
            2
          </span>
          AGENT REGISTER & PAYMENTS
        </button>
      </div>
    </header>
  );
};
