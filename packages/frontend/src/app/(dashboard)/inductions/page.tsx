'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { apiFetch } from '@/lib/api';
import { ClipboardCheck, Search, Filter, Loader2, Plus, Camera, RefreshCcw, X, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Induction {
  id: string;
  staffId: string;
  startDate: string;
  status: string;
  notes: string | null;
  taxIdVerified: boolean;
  captureImage?: string | null;
  staff: {
    firstName: string;
    lastName: string;
    position: string;
  };
}

export default function InductionsPage() {
  const [inductions, setInductions] = useState<Induction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Camera State
  const [captureImage, setCaptureImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    fetchInductions();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await apiFetch('/api/staff?limit=1000');
      if (res.success) {
        setStaffList(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch staff', error);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access denied or error: ", err);
      alert("Unable to access camera. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const wrapUploadModalClose = () => {
    stopCamera();
    setShowModal(false);
  };

  useEffect(() => {
    if (showModal) {
      startCamera();
      fetchStaff();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [showModal]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        setCaptureImage(imgData);
        stopCamera();
      }
    }
  };

  const handleCreateInduction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return alert('Select staff member');
    if (!captureImage) return alert('Please capture a photo for the induction requirement');
    
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/induction', {
        method: 'POST',
        body: JSON.stringify({
          staffId: selectedStaffId,
          startDate,
          notes,
          status: 'COMPLETED',
          captureImage
        })
      });
      if (res.success) {
        wrapUploadModalClose();
        fetchInductions();
        setSelectedStaffId('');
        setNotes('');
        setCaptureImage(null);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchInductions = async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch('/api/induction');
      if (res.success) {
        setInductions(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch inductions', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Staff Inductions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage onboarding and induction status for your staff members</p>
        </div>
        
        {user && ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role) && (
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600">
            <Plus className="w-4 h-4" />
            New Induction
          </button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Induction Log</h3>
              <p className="text-sm text-gray-500">Comprehensive record of all staff inductions</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search staff..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
              />
            </div>
            <button className="flex items-center justify-center w-9 h-9 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition flex-shrink-0">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Staff Member</th>
                  <th className="px-6 py-4 font-medium">Position</th>
                  <th className="px-6 py-4 font-medium">Start Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Photo</th>
                  <th className="px-6 py-4 font-medium">Tax Verified</th>
                  <th className="px-6 py-4 font-medium">Notes</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        <p className="font-medium text-sm">Loading inductions...</p>
                      </div>
                    </td>
                  </tr>
                ) : inductions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                          <ClipboardCheck className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-base font-medium text-gray-900">No inductions found</p>
                        <p className="text-sm">Get started by creating a new staff induction.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  inductions.map((ind) => (
                    <tr key={ind.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{ind.staff.firstName} {ind.staff.lastName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-500">{ind.staff.position}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">
                          {new Date(ind.startDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={ind.status === 'COMPLETED' ? 'ACTIVE' : ind.status === 'PENDING' ? 'INACTIVE' : 'WARNING'}>
                          {ind.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {ind.captureImage ? (
                          <span className="inline-flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md text-xs font-semibold" title="Photo Captured"><ImageIcon className="w-3.5 h-3.5" /> Yes</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md text-xs font-semibold">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {ind.taxIdVerified ? (
                          <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2.5 py-1 rounded-md text-xs font-semibold"><ClipboardCheck className="w-3.5 h-3.5" /> Yes</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2.5 py-1 rounded-md text-xs font-semibold">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {ind.notes || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-indigo-600 hover:text-indigo-800 font-medium">Edit</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">New Staff Induction</h3>
              <button onClick={wrapUploadModalClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleCreateInduction} className="p-6 space-y-5 overflow-y-auto">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Staff Member</label>
                    <select required value={selectedStaffId} onChange={e => setSelectedStaffId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                       <option value="">-- Select Staff --</option>
                       {staffList.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.position})</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                    <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                 </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                  <input value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1.5">Induction Photo Capture (Required)</label>
                 <div className="bg-gray-100 rounded-xl overflow-hidden flex flex-col items-center justify-center p-4 border border-gray-200">
                   {!captureImage ? (
                     <>
                        <video ref={videoRef} autoPlay playsInline className="w-full max-w-sm rounded-lg border border-gray-300 bg-black mb-3" />
                        <button type="button" onClick={capturePhoto} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                           <Camera className="w-4 h-4" /> Capture Photo
                        </button>
                     </>
                   ) : (
                     <>
                        <img src={captureImage} alt="Captured" className="w-full max-w-sm rounded-lg border border-gray-300 mb-3" />
                        <button type="button" onClick={() => { setCaptureImage(null); startCamera(); }} className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition">
                           <RefreshCcw className="w-4 h-4" /> Retake
                        </button>
                     </>
                   )}
                   <canvas ref={canvasRef} className="hidden" />
                 </div>
               </div>

               <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                 <button type="button" onClick={wrapUploadModalClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                 <button type="submit" disabled={submitting || !captureImage} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
                    <CheckCircle className="w-4 h-4" /> {submitting ? 'Saving...' : 'Complete Induction'}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
