'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Staff } from '@/types';
import { ArrowLeft, Send, FileText, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function StaffLettersPage() {
  const params = useParams();
  const router = useRouter();
  
  const [staff, setStaff] = useState<Staff | null>(null);
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  
  const [letterType, setLetterType] = useState('PROMOTION');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      const [staffRes, lettersRes] = await Promise.all([
        apiFetch(`/api/staff/${params.id}`),
        apiFetch(`/api/staff-letters?staffId=${params.id}`)
      ]);
      setStaff(staffRes.data);
      setLetters(lettersRes.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      // Create Letter
      const createRes = await apiFetch('/api/staff-letters', {
        method: 'POST',
        body: JSON.stringify({
          staffId: params.id,
          type: letterType,
          subject,
          content
        })
      });
      
      const newLetterId = createRes.data.id;
      
      // Send Letter
      await apiFetch(`/api/staff-letters/${newLetterId}/send`, { method: 'POST' });
      
      setShowModal(false);
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

  const setTemplate = (type: string) => {
    setLetterType(type);
    if (!staff) return;
    
    if (type === 'PROMOTION') {
       setSubject(`Congratulations on your Promotion - ${staff.firstName} ${staff.lastName}`);
       setContent(`We are thrilled to inform you that you have been promoted.\n\nYour hard work and dedication have been recognized and we look forward to your continued success in your new role.`);
    } else if (type === 'WARNING') {
       setSubject(`Official Warning Notice - ${staff.firstName} ${staff.lastName}`);
       setContent(`This letter serves as an official warning regarding your recent conduct/performance.\n\nPlease ensure immediate improvement to avoid further disciplinary action.`);
    } else if (type === 'TERMINATION') {
       setSubject(`Notice of Termination of Employment`);
       setContent(`It is with regret that we inform you that your employment stands terminated.\n\nPlease refer to HR for your final settlement details.`);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  if (!staff) return <div className="text-center text-gray-500 py-12">Staff not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/staff" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Letters & Correspondence</h1>
            <p className="text-gray-500">{staff.firstName} {staff.lastName} ({staff.staffId}) - {staff.email}</p>
          </div>
        </div>
        <button 
          onClick={() => { setShowModal(true); setTemplate('PROMOTION'); }} 
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" /> New Letter
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 flex items-center gap-2 text-sm font-medium text-gray-500"><FileText className="w-4 h-4" /> Type</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Subject</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Sent Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {letters.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">No letters have been sent to this staff member yet.</td>
              </tr>
            ) : (
              letters.map(letter => (
                <tr key={letter.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${letter.type === 'PROMOTION' ? 'bg-green-100 text-green-800' : 
                          letter.type === 'WARNING' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                       {letter.type}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{letter.subject}</td>
                  <td className="px-6 py-4 text-sm">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${letter.status === 'SENT' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {letter.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {letter.sentAt ? new Date(letter.sentAt).toLocaleString() : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Draft & Send Letter</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleCreateAndSend} className="p-6 space-y-5">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Letter Type</label>
                  <select 
                    value={letterType} 
                    onChange={e => setTemplate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="PROMOTION">Promotion Letter</option>
                    <option value="WARNING">Warning Letter</option>
                    <option value="TERMINATION">Termination Letter</option>
                  </select>
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                  <input 
                    required
                    value={subject} 
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Letter Content</label>
                  <textarea 
                    required
                    rows={8}
                    value={content} 
                    onChange={e => setContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" 
                  />
               </div>

               <div className="flex justify-end gap-3 pt-4">
                 <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                 <button type="submit" disabled={sending} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
                    <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Email'}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
