import React, { useState } from 'react';
import { Customer, DocumentStatus, CaseStatus, ServiceCategory } from '../../types';
import { SERVICE_CATEGORIES, CASE_STATUSES } from '../../utils/initialData';
import { X, UserPlus, Check } from 'lucide-react';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomer: (customer: Customer) => void;
  existingCustomersCount: number;
  availableAgents: string[];
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onAddCustomer,
  existingCustomersCount,
  availableAgents,
}) => {
  if (!isOpen) return null;

  // Auto-generate next ID
  const nextIdNumber = existingCustomersCount + 1;
  const autoId = `CUST-${String(nextIdNumber).padStart(4, '0')}`;
  const today = new Date().toISOString().split('T')[0];

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('Visa');
  const [destinationCountry, setDestinationCountry] = useState('Saudi Arabia');
  const [assignedAgent, setAssignedAgent] = useState(availableAgents[0] || 'Al-Haramain Travel Services');
  const [agreedFee, setAgreedFee] = useState<number>(100000);
  const [documentsReceived, setDocumentsReceived] = useState<DocumentStatus>('Partial');
  const [documentsSentToAgent, setDocumentsSentToAgent] = useState<DocumentStatus>('No');
  const [caseStatus, setCaseStatus] = useState<CaseStatus>('New Inquiry');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(today);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const newCustomer: Customer = {
      id: autoId,
      registrationDate: today,
      fullName: fullName.trim(),
      phone: phone.trim() || whatsapp.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      email: email.trim(),
      city: city.trim() || 'Lahore',
      fullAddress: fullAddress.trim(),
      passportNumber: passportNumber.trim(),
      serviceCategory,
      destinationCountry: destinationCountry.trim(),
      assignedAgent,
      agreedFee: Number(agreedFee) || 0,
      documentsReceived,
      documentsSentToAgent,
      caseStatus,
      nextFollowUpDate,
      lastUpdated: today,
      notes: notes.trim(),
    };

    onAddCustomer(newCustomer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden my-8">
        <div className="bg-[#0B1F3A] px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-base">Add New Customer (نیا کسٹمر شامل کریں)</h3>
            <span className="text-xs font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded">
              {autoId}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Full Name * (مکمل نام)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Muhammad Asif"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Passport Number (پاسپورٹ نمبر)
              </label>
              <input
                type="text"
                placeholder="e.g. PK876543"
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Phone Number * (فون نمبر)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 0300-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                WhatsApp Number (واٹس ایپ)
              </label>
              <input
                type="text"
                placeholder="e.g. 0300-1234567"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="asif@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                City (شہر)
              </label>
              <input
                type="text"
                placeholder="e.g. Lahore / Rawalpindi"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Full Residential Address
              </label>
              <input
                type="text"
                placeholder="Complete street, area, and city address"
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Service Category * (سروس کی قسم)
              </label>
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value as ServiceCategory)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              >
                {SERVICE_CATEGORIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Destination Country * (ملک)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Saudi Arabia, UK, UAE"
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Assigned Agent * (ایجنٹ)
              </label>
              <select
                value={assignedAgent}
                onChange={(e) => setAssignedAgent(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              >
                {availableAgents.map((ag) => (
                  <option key={ag} value={ag}>{ag}</option>
                ))}
                <option value="Direct / Self">Direct / Self (No Agent)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Agreed Customer Fee * (PKR) (طے شدہ فیس)
              </label>
              <input
                type="number"
                required
                min={0}
                value={agreedFee}
                onChange={(e) => setAgreedFee(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono font-bold"
              />
              <span className="text-[10px] text-slate-500">
                Accounting Rule: Agreed fee ko received nahi mana jayega jab tak payment na aaye.
              </span>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Case Status *
              </label>
              <select
                value={caseStatus}
                onChange={(e) => setCaseStatus(e.target.value as CaseStatus)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              >
                {CASE_STATUSES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Next Follow-up Date
              </label>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Case Notes / Instructions
            </label>
            <textarea
              rows={2}
              placeholder="Important documents received, requirements, or embassy details..."
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
              <Check className="w-4 h-4" /> Save Customer ({autoId})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
