import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, BookOpen, AlertTriangle, CloudUpload, ShieldCheck } from 'lucide-react';

export const InstructionSection: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="no-print bg-slate-900 border border-slate-700 rounded-xl p-4 sm:p-5 text-slate-200 shadow-sm transition-all mb-6">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
              System Blueprint & Operating Instructions (ہدایات اور اکاؤنٹنگ قوانین)
              <span className="text-xs font-normal text-teal-400 bg-teal-950/60 border border-teal-800 px-2 py-0.5 rounded-full">
                5 Simple Steps
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Click to view complete Google Sheets workflow, accounting safety principles, and Drive setup.
            </p>
          </div>
        </div>
        <button
          className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white"
          aria-label={isOpen ? 'Collapse instructions' : 'Expand instructions'}
        >
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 text-xs sm:text-sm">
          {/* 5 Operational Steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 mb-1.5 text-teal-400 font-bold text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300">1</span>
                Naya Customer
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                <strong className="text-white">CUSTOMER REGISTER</strong> mein row darj karein. Customer ID (<code className="text-teal-300">CUST-0001</code>) khud ba khud ban jayegi.
              </p>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 mb-1.5 text-teal-400 font-bold text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300">2</span>
                Customer Payment
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                <strong className="text-white">Payment Ledger</strong> mein nayi line: Date, Customer ID, Type <span className="text-emerald-400 font-medium">Customer Receipt</span> ya Refund likhein. Purani line overwrite na karein.
              </p>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 mb-1.5 text-teal-400 font-bold text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300">3</span>
                Agent Payment
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Agent payment hamesha <strong className="text-white">AGENT REGISTER</strong> ke payment ledger mein darj karein taake double-counting na ho.
              </p>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 mb-1.5 text-teal-400 font-bold text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300">4</span>
                Case Status & Alert
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Case status dropdown aur Next Follow-up date update karein. Agar follow-up guzar jaye to <span className="text-rose-400 font-bold">OVERDUE</span> alert khud ajayega.
              </p>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 mb-1.5 text-teal-400 font-bold text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300">5</span>
                Final Report
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                <strong className="text-white">FINAL REPORT DASHBOARD</strong> par Customer ID chunein, fees, receipts, agent costs, aur commission khud calculate ho jayenge.
              </p>
            </div>
          </div>

          {/* Safety & Accounting Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div className="bg-teal-950/40 border border-teal-800/60 p-3.5 rounded-lg">
              <h4 className="font-semibold text-teal-300 flex items-center gap-2 text-xs uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                Bunyadi Accounting Usool (Safety Rules)
              </h4>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
                <li><strong className="text-slate-100">Agreed Fee ko kabhi &quot;Received&quot; nahi mana jata</strong>: Asal received sirf transaction ledger se calculate hoti hai.</li>
                <li><strong className="text-slate-100">Outstanding Balance hamesha safe hai</strong>: <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">MAX(0, Agreed Fee - Net Payments)</code>, negative kabhi nahi dikhta.</li>
                <li><strong className="text-slate-100">Agent payments authoritative source</strong>: AGENT REGISTER ledger authoritative hai taake double counting na ho.</li>
                <li><strong className="text-slate-100">Commission Label</strong>: Hamesha &quot;Estimated Profit (Cash Basis)&quot; ya &quot;Expected Profit&quot; likha jata hai, kabhi &quot;Confirmed&quot; nahi.</li>
              </ul>
            </div>

            <div className="bg-slate-800/60 border border-slate-700 p-3.5 rounded-lg">
              <h4 className="font-semibold text-emerald-300 flex items-center gap-2 text-xs uppercase tracking-wider mb-2">
                <CloudUpload className="w-4 h-4 text-emerald-400" />
                Google Drive & Google Sheets Integration
              </h4>
              <div className="space-y-2 text-xs text-slate-300">
                <p className="text-emerald-300 font-medium">
                  ⚡ <strong>Direct Live Creation:</strong> Upar diye gaye <strong className="text-white bg-emerald-700 px-1.5 py-0.5 rounded">Google Sheet</strong> button par click karein aur &quot;Create Live Google Sheet Now&quot; dabayein. Ye sheet seedha aap ke Google Drive account mein ban jayegi!
                </p>
                <div className="border-t border-slate-700/80 pt-1.5">
                  <span className="text-[11px] text-slate-400 block font-semibold">Manual Upload Option:</span>
                  <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-300">
                    <li><strong className="text-white">Export .xlsx</strong> dabayein.</li>
                    <li>Google Drive mein <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-200">New → File upload</code> karein.</li>
                    <li>Right-click karke <strong className="text-white">Open with → Google Sheets</strong> chunein aur Save karein.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
