import React, { useState } from 'react';
import { Customer, AgentAssignment, AgentWorkStatus, DocumentStatus, ServiceCategory } from '../../types';
import { AGENT_WORK_STATUSES, SERVICE_CATEGORIES } from '../../utils/initialData';
import { X, Users, Check } from 'lucide-react';

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  existingAssignments: AgentAssignment[];
  onAddAssignment: (assignment: AgentAssignment) => void;
}

export const AddAgentModal: React.FC<AddAgentModalProps> = ({
  isOpen,
  onClose,
  customers,
  existingAssignments,
  onAddAssignment,
}) => {
  if (!isOpen) return null;

  // Extract distinct known agents
  const knownAgentsMap = new Map<string, { id: string; phone: string; whatsapp: string; email: string; address: string }>();
  existingAssignments.forEach((a) => {
    if (!knownAgentsMap.has(a.agentName)) {
      knownAgentsMap.set(a.agentName, {
        id: a.agentId,
        phone: a.phone,
        whatsapp: a.whatsapp,
        email: a.email,
        address: a.cityAddress,
      });
    }
  });

  const nextAgentNum = knownAgentsMap.size + 1;
  const autoNewAgentId = `AGENT-${String(nextAgentNum).padStart(4, '0')}`;

  const [agentName, setAgentName] = useState(Array.from(knownAgentsMap.keys())[0] || 'Al-Haramain Travel Services');
  const [phone, setPhone] = useState('0321-4567890');
  const [whatsapp, setWhatsapp] = useState('0321-4567890');
  const [email, setEmail] = useState('ops@alharamain.com.pk');
  const [cityAddress, setCityAddress] = useState('Lahore');
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('Visa');
  const [agreedAgentCost, setAgreedAgentCost] = useState<number>(50000);
  const [documentsSent, setDocumentsSent] = useState<DocumentStatus>('Yes');
  const [documentsReceived, setDocumentsReceived] = useState<DocumentStatus>('No');
  const [agentWorkStatus, setAgentWorkStatus] = useState<AgentWorkStatus>('Submitted to Agent');
  const [expectedCompletionDate, setExpectedCompletionDate] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');

  const handleAgentSelect = (name: string) => {
    setAgentName(name);
    const existing = knownAgentsMap.get(name);
    if (existing) {
      setPhone(existing.phone);
      setWhatsapp(existing.whatsapp);
      setEmail(existing.email);
      setCityAddress(existing.address);
    }
  };

  const handleCustomerChange = (cId: string) => {
    setCustomerId(cId);
    const found = customers.find((c) => c.id === cId);
    if (found) {
      setServiceCategory(found.serviceCategory);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = knownAgentsMap.get(agentName);
    const finalAgentId = existing ? existing.id : autoNewAgentId;
    const selectedCust = customers.find((c) => c.id === customerId);

    const assignment: AgentAssignment = {
      agentId: finalAgentId,
      agentName: agentName.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      cityAddress: cityAddress.trim(),
      customerId,
      customerName: selectedCust ? selectedCust.fullName : 'Customer',
      serviceCategory,
      agreedAgentCost: Number(agreedAgentCost) || 0,
      documentsSent,
      documentsReceived,
      agentWorkStatus,
      expectedCompletionDate,
      notes: notes.trim(),
    };

    onAddAssignment(assignment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden my-8">
        <div className="bg-[#0B1F3A] px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base">Assign Agent to Customer (ایجنٹ کو کیس سپرد کریں)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Select or Enter Agent / Agency Name *
              </label>
              <input
                type="text"
                required
                list="agent-suggestions"
                value={agentName}
                onChange={(e) => handleAgentSelect(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-medium"
              />
              <datalist id="agent-suggestions">
                {Array.from(knownAgentsMap.keys()).map((ag) => (
                  <option key={ag} value={ag} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Assign to Customer *
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

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Agent Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Agent WhatsApp
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Agreed Agent Cost * (PKR) (طے شدہ لاگت)
              </label>
              <input
                type="number"
                required
                min={0}
                value={agreedAgentCost}
                onChange={(e) => setAgreedAgentCost(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Expected Completion Date
              </label>
              <input
                type="date"
                value={expectedCompletionDate}
                onChange={(e) => setExpectedCompletionDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Agent Work Status
              </label>
              <select
                value={agentWorkStatus}
                onChange={(e) => setAgentWorkStatus(e.target.value as AgentWorkStatus)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              >
                {AGENT_WORK_STATUSES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Service Category
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
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Assignment Notes & Special Requirements
            </label>
            <input
              type="text"
              placeholder="e.g. GAMCA medical token issued, original passport submitted..."
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
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow"
            >
              <Check className="w-4 h-4" /> Save Agent Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
