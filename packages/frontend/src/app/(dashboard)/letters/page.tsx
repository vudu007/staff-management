'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Staff } from '@/types';
import { Mail, Send, FileText, Plus, X, Search, Filter, Loader2, User } from 'lucide-react';

export default function GlobalStaffLettersPage() {
  const [letters, setLetters] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [letterType, setLetterType] = useState('PROMOTION');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lettersRes, staffRes] = await Promise.all([
        apiFetch('/api/staff-letters?limit=1000'),
        apiFetch('/api/staff?limit=1000')
      ]);
      setLetters(lettersRes.data || []);
      setStaffList(staffRes.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return alert("Please select a staff member.");
    
    setSending(true);
    try {
      // Create Letter
      const createRes = await apiFetch('/api/staff-letters', {
        method: 'POST',
        body: JSON.stringify({
          staffId: selectedStaffId,
          type: letterType,
          subject,
          content
        })
      });
      
      const newLetterId = createRes.data.id;
      
      // Send Letter
      await apiFetch(`/api/staff-letters/${newLetterId}/send`, { method: 'POST' });
      
      setShowModal(false);
      setSelectedStaffId('');
      setLetterType('PROMOTION');
      setSubject('');
      setContent('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  const setTemplate = (type: string, currentStaffId: string) => {
    setLetterType(type);
    const targetStaff = staffList.find(s => s.id === currentStaffId);
    const nameStr = targetStaff ? `${targetStaff.firstName} ${targetStaff.lastName}` : 'Staff Member';
    
    if (type === 'PROMOTION') {
       setSubject(`Congratulations on your Promotion - ${nameStr}`);
       setContent(`We are thrilled to inform you that you have been promoted.\n\nYour hard work and dedication have been recognized and we look forward to your continued success in your new role.`);
    } else if (type === 'WARNING') {
       setSubject(`Official Warning Notice - ${nameStr}`);
       setContent(`This letter serves as an official warning regarding your recent conduct/performance.\n\nPlease ensure immediate improvement to avoid further disciplinary action.`);
    } else if (type === 'TERMINATION') {
       setSubject(`Notice of Termination of Employment`);
       setContent(`It is with regret that we inform you that your employment stands terminated.\n\nPlease refer to HR for your final settlement details.`);
    }
  };

  useEffect(() => {
    if (selectedStaffId && subject) {
       setTemplate(letterType, selectedStaffId);
    }
  }, [selectedStaffId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Staff Letters & Dispatches</h1>
          <p className="text-sm text-gray-500 mt-1">Manage, draft, and automatically email correspondence to any staff member</p>
        </div>
        
        <button 
          onClick={() => { setShowModal(true); setTemplate('PROMOTION', selectedStaffId); }} 
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
        >
          <Plus className="w-4 h-4" />
          Draft New Letter
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
               <Mail className="w-5 h-5" />
             </div>
             <div>
               <h3 className="font-semibold text-gray-900 text-sm">Dispatch Log</h3>
               <p className="text-xs text-gray-500">History of all sent automated emails and letters</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search letters..."
                className="pl-9 pr-4 py-2 w-full sm:w-64 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <button className="p-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Letter Type</th>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Sent Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        Loading dispatches...
                      </div>
                   </td>
                </tr>
              ) : letters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                     <div className="flex flex-col items-center gap-2">
                       <FileText className="w-8 h-8 text-gray-300" />
                       <p>No correspondence logged yet.</p>
                     </div>
                  </td>
                </tr>
              ) : (
                letters.map(letter => (
                  <tr key={letter.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                       <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold 
                          ${letter.type === 'PROMOTION' ? 'bg-green-100 text-green-700' : 
                            letter.type === 'WARNING' ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-red-100 text-red-700'}`}>
                         {letter.type}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 shadow-sm overflow-hidden">
                            {letter.staff?.profilePicture ? (
                               <img src={letter.staff.profilePicture} alt="" className="w-full h-full object-cover" />
                            ) : (
                               letter.staff?.firstName?.charAt(0) || '?'
                            )}
                         </div>
                         <span className="font-medium text-gray-900">{letter.staff?.firstName} {letter.staff?.lastName}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 max-w-xs truncate" title={letter.subject}>{letter.subject}</td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${letter.status === 'SENT' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                          {letter.status === 'SENT' ? <Send className="w-3 h-3 mr-1" /> : null}
                          {letter.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {letter.sentAt ? new Date(letter.sentAt).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                 <h3 className="text-xl font-bold text-gray-900">Draft & Dispatch Letter</h3>
                 <p className="text-xs text-gray-500 mt-1">Correspondence will be emailed automatically directly to the staff</p>
              </div>
              <button disabled={sending} onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                 <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateAndSend} className="p-6 space-y-5 overflow-y-auto">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"><User className="w-4 h-4 text-indigo-500" /> Target Staff Member</label>
                    <select 
                      required
                      value={selectedStaffId} 
                      onChange={e => setSelectedStaffId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="">-- Select Staff --</option>
                      {staffList.map(s => (
                        <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.position})</option>
                      ))}
                    </select>
                 </div>
                 
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"><FileText className="w-4 h-4 text-indigo-500" /> Letter Theme / Template</label>
                    <select 
                      value={letterType} 
                      onChange={e => setTemplate(e.target.value, selectedStaffId)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="PROMOTION">Promotion</option>
                      <option value="WARNING">Official Warning</option>
                      <option value="TERMINATION">Termination</option>
                    </select>
                 </div>
               </div>
               
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject Line</label>
                  <input 
                    required
                    value={subject} 
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Enter email subject"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900" 
                  />
               </div>
               
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Official Message Content</label>
                  <textarea 
                    required
                    rows={8}
                    value={content} 
                    onChange={e => setContent(e.target.value)}
                    placeholder="Type the formal letter content here..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none transition-all leading-relaxed text-gray-800" 
                  />
               </div>

               <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                 <button type="button" disabled={sending} onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                 <button type="submit" disabled={sending || !selectedStaffId} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed min-w-[140px]">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {sending ? 'Dispatching...' : 'Dispatch Letter'}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
