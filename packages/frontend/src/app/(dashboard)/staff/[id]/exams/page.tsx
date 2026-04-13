'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Staff } from '@/types';
import { ArrowLeft, CheckCircle, Search, FileSignature, GraduationCap, X, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function ExamVerificationsPage() {
  const params = useParams();
  
  const [staff, setStaff] = useState<Staff | null>(null);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  
  const [examBody, setExamBody] = useState('WAEC');
  const [examType, setExamType] = useState('MAY/JUNE');
  const [examYear, setExamYear] = useState('2023');
  const [examNumber, setExamNumber] = useState('');
  const [pin, setPin] = useState('');

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      const [staffRes, examsRes] = await Promise.all([
        apiFetch(`/api/staff/${params.id}`),
        apiFetch(`/api/exam-verification/staff/${params.id}`)
      ]);
      setStaff(staffRes.data);
      setVerifications(examsRes.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    try {
      await apiFetch('/api/exam-verification', {
        method: 'POST',
        body: JSON.stringify({
          staffId: params.id,
          examBody,
          examType,
          examYear,
          examNumber,
          pin
        })
      });
      
      setShowModal(false);
      setExamNumber('');
      setPin('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>;
  if (!staff) return <div className="text-center text-gray-500 py-12">Staff not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/staff/${staff.id}`} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><GraduationCap className="text-green-600 w-6 h-6" /> Credential Checking</h1>
            <p className="text-gray-500 font-medium">Verified WAEC/NECO results for {staff.firstName} {staff.lastName}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 shadow-sm font-semibold transition"
        >
          <Search className="w-4 h-4" /> Verify New Result
        </button>
      </div>

      <div className="space-y-6 pt-4">
        {verifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
             <div className="bg-gray-50 p-4 rounded-full mb-4">
                <FileSignature className="w-10 h-10 text-gray-300" />
             </div>
             <h3 className="text-lg font-bold text-gray-900">No Verifications Found</h3>
             <p className="text-sm text-gray-500 mt-2 max-w-sm">There are no academic exam verifications natively attached to this staff's profile yet.</p>
          </div>
        ) : (
          verifications.map(verification => (
            <div key={verification.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
               <div className="bg-gray-50/50 p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                     <div className="flex items-center gap-2 mb-1">
                        <span className="font-black tracking-tight text-gray-900 text-lg">{verification.examBody}</span>
                        <span className="bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest">{verification.examType}</span>
                        <span className="bg-gray-800 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest">{verification.examYear}</span>
                     </div>
                     <p className="text-xs font-mono font-medium text-gray-500 flex items-center gap-2">
                        Candidate Number: {verification.examNumber} 
                        {verification.isVerified && <span className="text-green-600 flex items-center gap-1 font-sans font-semibold"><ShieldCheck className="w-3.5 h-3.5" /> SECURE MATCH</span>}
                     </p>
                  </div>
                  <div className="text-right text-xs font-medium text-gray-400">
                     Verified on: {new Date(verification.verificationDate).toLocaleDateString()}
                  </div>
               </div>
               <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                     {verification.results.map((r: any, idx: number) => {
                        const isA = r.grade.startsWith('A');
                        const isB = r.grade.startsWith('B');
                        const isC = r.grade.startsWith('C');
                        
                        return (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100/50">
                             <span className="font-medium text-gray-700 text-sm">{r.subject}</span>
                             <span className={`font-black text-sm px-2 py-1 rounded bg-white shadow-sm border
                                ${isA ? 'text-green-600 border-green-200' : 
                                  isB ? 'text-blue-600 border-blue-200' : 
                                  isC ? 'text-yellow-600 border-yellow-200' : 
                                  'text-red-600 border-red-200'}
                             `}>
                               {r.grade}
                             </span>
                          </div>
                        )
                     })}
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-green-600" /> Identity verification</h3>
              <button disabled={verifying} onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleVerify} className="p-6 space-y-4">
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Exam Body</label>
                    <select 
                      value={examBody} 
                      onChange={e => setExamBody(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    >
                      <option value="WAEC">WAEC</option>
                      <option value="NECO">NECO</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Exam Year</label>
                    <select 
                      value={examYear} 
                      onChange={e => setExamYear(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    >
                      {Array.from({length: 20}).map((_, i) => {
                         const year = 2024 - i;
                         return <option key={year} value={year}>{year}</option>
                      })}
                    </select>
                 </div>
               </div>
               
               <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Exam Type</label>
                  <select 
                    value={examType} 
                    onChange={e => setExamType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  >
                    <option value="MAY/JUNE">School Candidate (MAY/JUNE)</option>
                    <option value="NOV/DEC">Private Candidate (GCE)</option>
                  </select>
               </div>
               
               <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Candidate Exam Number</label>
                  <input 
                    required
                    value={examNumber} 
                    onChange={e => setExamNumber(e.target.value)}
                    placeholder="e.g. 4251234567"
                    className="w-full px-4 py-2.5 font-mono bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 placeholder:text-gray-300 placeholder:font-sans" 
                  />
               </div>
               
               <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Scratch Card PIN (Optional for Demo)</label>
                  <input 
                    value={pin} 
                    onChange={e => setPin(e.target.value)}
                    placeholder="12-digit PIN code"
                    className="w-full px-4 py-2.5 font-mono bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 placeholder:text-gray-300 placeholder:font-sans" 
                  />
               </div>

               <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                 <p className="text-[10px] text-gray-400 font-medium">Billed at validation endpoint.</p>
                 <button type="submit" disabled={verifying || !examNumber} className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-xl text-sm hover:bg-black transition-all disabled:opacity-50 min-w-[130px] justify-center shadow-lg shadow-gray-900/20">
                    {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {verifying ? 'Checking...' : 'Check Result'}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
