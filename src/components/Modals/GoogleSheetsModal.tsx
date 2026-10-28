import React, { useState } from 'react';
import { Customer, CustomerPaymentTransaction, AgentAssignment, AgentPaymentTransaction } from '../../types';
import { googleSignIn, googleLogout, getAccessToken } from '../../services/googleAuth';
import { createGoogleSheetsSpreadsheet, CreateGoogleSheetResult } from '../../services/googleSheets';
import { User } from 'firebase/auth';
import {
  X,
  FileSpreadsheet,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CloudUpload,
  Download,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  customerTransactions: CustomerPaymentTransaction[];
  agentAssignments: AgentAssignment[];
  agentTransactions: AgentPaymentTransaction[];
  currentUser: User | null;
  onUserChange: (user: User | null) => void;
  onExportLocalExcel: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  customers,
  customerTransactions,
  agentAssignments,
  agentTransactions,
  currentUser,
  onUserChange,
  onExportLocalExcel,
}) => {
  if (!isOpen) return null;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateGoogleSheetResult | null>(null);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        onUserChange(res.user);
      }
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await googleLogout();
    onUserChange(null);
    setResult(null);
  };

  const handleCreateGoogleSheet = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let token = await getAccessToken();
      if (!token) {
        const authRes = await googleSignIn();
        if (!authRes) throw new Error('Authentication required to create Google Sheet.');
        onUserChange(authRes.user);
        token = authRes.accessToken;
      }

      const res = await createGoogleSheetsSpreadsheet(
        token,
        customers,
        customerTransactions,
        agentAssignments,
        agentTransactions
      );
      setResult(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to create Google Sheet.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden my-6 text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="bg-[#0B1F3A] px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Google Sheets Integration (گوگل شیٹس)</h3>
              <p className="text-[11px] text-slate-300">Sync & create live spreadsheet directly in Google Drive</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs sm:text-sm">
          {/* User state banner */}
          {currentUser ? (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-emerald-500" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
                    {currentUser.displayName?.charAt(0) || 'G'}
                  </div>
                )}
                <div>
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 block text-xs">
                    Connected: {currentUser.displayName || currentUser.email}
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400">{currentUser.email}</span>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          ) : (
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Apne Google account ke sath sign in karein taake Google Sheet aap ki Google Drive mein seedha save ho sake.
              </p>
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg shadow-sm font-semibold text-xs transition mx-auto cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                Sign in with Google
              </button>
            </div>
          )}

          {/* Action to create */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CloudUpload className="w-4 h-4 text-emerald-600" />
              1. Create Live Google Sheet (Direct In Google Drive)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Ye button aap ke Google Drive mein 3 mukammal sheets (FINAL REPORT DASHBOARD, CUSTOMER REGISTER, AGENT REGISTER) bana kar live formulas aur data darj kar dega.
            </p>

            <button
              onClick={handleCreateGoogleSheet}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow flex items-center justify-center gap-2 transition"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Google Sheet in your Drive...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  Create Live Google Sheet Now (گوگل شیٹ بنائیں)
                </>
              )}
            </button>
          </div>

          {/* Result Success Banner */}
          {result && (
            <div className="p-4 bg-teal-50 dark:bg-teal-950/50 border border-teal-300 dark:border-teal-700 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                Aap ki Google Sheet kamiyabi se ban chuki hai!
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-mono break-all">
                ID: {result.spreadsheetId}
              </p>
              <a
                href={result.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-lg shadow transition"
              >
                Open in Google Sheets (گوگل شیٹ کھولیں) <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Fallback Option: Direct .xlsx download */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Ya seedha computer par .xlsx file download karein:</span>
            <button
              onClick={() => {
                onExportLocalExcel();
                onClose();
              }}
              className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 font-semibold hover:underline"
            >
              <Download className="w-3.5 h-3.5" /> Download .xlsx
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
