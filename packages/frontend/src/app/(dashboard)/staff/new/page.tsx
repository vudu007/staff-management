'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Store } from '@/types';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewStaffPage() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', staffId: '', position: '', phone: '', email: '',
    department: '', storeId: '', status: 'ACTIVE', hireDate: '', taxId: '',
    gender: '', dob: '', duration: '', address: '', stateOfOrigin: '', lgaOfOrigin: '',
    nextOfKinName: '', nextOfKinPhone: '', nextOfKinAddress: '',
    guarantorName: '', guarantorPhone: '', guarantorAddress: '', guarantorEmail: '',
    emergencyContactName: '', emergencyContactPhone: '', emergencyContactAddress: ''
  });

  useEffect(() => {
    apiFetch('/api/stores').then(res => setStores(res.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = { ...form };
      if (!payload.dob) delete payload.dob; // Prevent sending empty string as date
      if (!payload.hireDate) delete payload.hireDate;

      await apiFetch('/api/staff', { method: 'POST', body: JSON.stringify(payload) });
      router.push('/staff');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (field: string, val: string) => setForm(prev => ({...prev, [field]: val}));

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/staff" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Staff</h1>
          <p className="text-gray-500">Comprehensive staff onboarding form</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8 space-y-8 shadow-sm">
        
        {/* Core Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Core Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>First Name *</label>
              <input required value={form.firstName} onChange={e => handleInput('firstName', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Last Name *</label>
              <input required value={form.lastName} onChange={e => handleInput('lastName', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Staff ID *</label>
              <input required value={form.staffId} onChange={e => handleInput('staffId', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Store *</label>
              <select required value={form.storeId} onChange={e => handleInput('storeId', e.target.value)} className={inputClass}>
                <option value="">Select store</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Position *</label>
              <input required value={form.position} onChange={e => handleInput('position', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Department</label>
              <input value={form.department} onChange={e => handleInput('department', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={e => handleInput('status', e.target.value)} className={inputClass}>
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Tax ID *</label>
              <input required value={form.taxId} onChange={e => handleInput('taxId', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hire Date</label>
              <input type="date" value={form.hireDate} onChange={e => handleInput('hireDate', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Duration (e.g. 1 Year)</label>
              <input value={form.duration} onChange={e => handleInput('duration', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Demographics & Contact */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Demographics & Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className={labelClass}>Gender</label>
              <select value={form.gender} onChange={e => handleInput('gender', e.target.value)} className={inputClass}>
                <option value="">Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input type="date" value={form.dob} onChange={e => handleInput('dob', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input value={form.phone} onChange={e => handleInput('phone', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={form.email} onChange={e => handleInput('email', e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Residential Address</label>
              <input value={form.address} onChange={e => handleInput('address', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>State of Origin</label>
              <input value={form.stateOfOrigin} onChange={e => handleInput('stateOfOrigin', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>LGA of Origin</label>
              <input value={form.lgaOfOrigin} onChange={e => handleInput('lgaOfOrigin', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Next of Kin & Emergency */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Next of Kin & Emergency Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">Next of Kin</h4>
              <div><input placeholder="Name" value={form.nextOfKinName} onChange={e => handleInput('nextOfKinName', e.target.value)} className={inputClass} /></div>
              <div><input placeholder="Phone" value={form.nextOfKinPhone} onChange={e => handleInput('nextOfKinPhone', e.target.value)} className={inputClass} /></div>
              <div><input placeholder="Address" value={form.nextOfKinAddress} onChange={e => handleInput('nextOfKinAddress', e.target.value)} className={inputClass} /></div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">Emergency Contact</h4>
              <div><input placeholder="Name" value={form.emergencyContactName} onChange={e => handleInput('emergencyContactName', e.target.value)} className={inputClass} /></div>
              <div><input placeholder="Phone" value={form.emergencyContactPhone} onChange={e => handleInput('emergencyContactPhone', e.target.value)} className={inputClass} /></div>
              <div><input placeholder="Address" value={form.emergencyContactAddress} onChange={e => handleInput('emergencyContactAddress', e.target.value)} className={inputClass} /></div>
            </div>
          </div>
        </div>

        {/* Guarantor */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Guarantor Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
             <div><label className={labelClass}>Full Name</label><input value={form.guarantorName} onChange={e => handleInput('guarantorName', e.target.value)} className={inputClass} /></div>
             <div><label className={labelClass}>Phone</label><input value={form.guarantorPhone} onChange={e => handleInput('guarantorPhone', e.target.value)} className={inputClass} /></div>
             <div><label className={labelClass}>Email</label><input type="email" value={form.guarantorEmail} onChange={e => handleInput('guarantorEmail', e.target.value)} className={inputClass} /></div>
             <div><label className={labelClass}>Residential Address</label><input value={form.guarantorAddress} onChange={e => handleInput('guarantorAddress', e.target.value)} className={inputClass} /></div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Link href="/staff" className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</Link>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white font-medium rounded-lg text-sm hover:bg-indigo-700 hover:shadow-md transition-all disabled:opacity-50">
            <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Staff'}
          </button>
        </div>
      </form>
    </div>
  );
}
