'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Staff, Store } from '@/types';
import { ArrowLeft, Save, Trash2, Key, Mail } from 'lucide-react';
import Link from 'next/link';

export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', position: '', phone: '', email: '',
    department: '', storeId: '', status: 'ACTIVE', hireDate: '',
    gender: '', dob: '', duration: '', address: '', stateOfOrigin: '', lgaOfOrigin: '',
    nextOfKinName: '', nextOfKinPhone: '', nextOfKinAddress: '',
    guarantorName: '', guarantorPhone: '', guarantorAddress: '', guarantorEmail: '',
    emergencyContactName: '', emergencyContactPhone: '', emergencyContactAddress: ''
  });

  useEffect(() => {
    Promise.all([
      apiFetch(`/api/staff/${params.id}`),
      apiFetch('/api/stores'),
    ]).then(([staffRes, storesRes]) => {
      setStaff(staffRes.data);
      setStores(storesRes.data || []);
      const s = staffRes.data;
      setForm({
        firstName: s.firstName || '', lastName: s.lastName || '', position: s.position || '',
        phone: s.phone || '', email: s.email || '', department: s.department || '',
        storeId: s.storeId || '', status: s.status || 'ACTIVE', hireDate: s.hireDate ? s.hireDate.split('T')[0] : '',
        gender: s.gender || '', dob: s.dob ? s.dob.split('T')[0] : '', duration: s.duration || '',
        address: s.address || '', stateOfOrigin: s.stateOfOrigin || '', lgaOfOrigin: s.lgaOfOrigin || '',
        nextOfKinName: s.nextOfKinName || '', nextOfKinPhone: s.nextOfKinPhone || '', nextOfKinAddress: s.nextOfKinAddress || '',
        guarantorName: s.guarantorName || '', guarantorPhone: s.guarantorPhone || '', guarantorAddress: s.guarantorAddress || '', guarantorEmail: s.guarantorEmail || '',
        emergencyContactName: s.emergencyContactName || '', emergencyContactPhone: s.emergencyContactPhone || '', emergencyContactAddress: s.emergencyContactAddress || ''
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [params.id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { ...form, resetPassword };
      if (!payload.dob) delete payload.dob;
      if (!payload.hireDate) delete payload.hireDate;

      await apiFetch(`/api/staff/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      router.push('/staff');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await apiFetch(`/api/staff/${params.id}`, { method: 'DELETE' });
      router.push('/staff');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleInput = (field: string, val: string) => setForm(prev => ({...prev, [field]: val}));

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  if (!staff) return <div className="text-center text-gray-500 py-12">Staff not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/staff" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Staff</h1>
            <p className="text-gray-500">{staff.firstName} {staff.lastName} ({staff.staffId})</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/staff/${params.id}/letters`} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <Mail className="w-4 h-4" /> Letters
          </Link>
          <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg text-sm hover:bg-red-700 transition-colors">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="bg-white rounded-xl border border-gray-200 p-8 space-y-8 shadow-sm">
        
        {/* Core Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Core Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>First Name</label>
              <input required value={form.firstName} onChange={e => handleInput('firstName', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input required value={form.lastName} onChange={e => handleInput('lastName', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Store</label>
              <select value={form.storeId} onChange={e => handleInput('storeId', e.target.value)} className={inputClass}>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Position</label>
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

        <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
          <input type="checkbox" id="resetPass" checked={resetPassword} onChange={e => setResetPassword(e.target.checked)} className="rounded" />
          <label htmlFor="resetPass" className="flex items-center gap-2 text-sm text-gray-700">
            <Key className="w-4 h-4" /> Reset password to a new random value
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Link href="/staff" className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</Link>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white font-medium rounded-lg text-sm hover:bg-indigo-700 hover:shadow-md transition-all disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
