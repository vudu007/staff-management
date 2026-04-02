'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Staff, Store } from '@/types';
import { ArrowLeft, Save, Trash2, Key } from 'lucide-react';
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
        firstName: s.firstName, lastName: s.lastName, position: s.position,
        phone: s.phone || '', email: s.email || '', department: s.department || '',
        storeId: s.storeId, status: s.status, hireDate: s.hireDate ? s.hireDate.split('T')[0] : '',
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [params.id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch(`/api/staff/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...form, resetPassword }),
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

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  if (!staff) return <div className="text-center text-gray-500 py-12">Staff not found</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/staff" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Staff</h1>
            <p className="text-gray-500">{staff.firstName} {staff.lastName} ({staff.staffId})</p>
          </div>
        </div>
        <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>

      <form onSubmit={handleUpdate} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
            <input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
            <input required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Position</label>
            <input required value={form.position} onChange={e => setForm({...form, position: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Store</label>
            <select value={form.storeId} onChange={e => setForm({...form, storeId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="TERMINATED">Terminated</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Hire Date</label>
            <input type="date" value={form.hireDate} onChange={e => setForm({...form, hireDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>

        <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
          <input type="checkbox" id="resetPass" checked={resetPassword} onChange={e => setResetPassword(e.target.checked)} className="rounded" />
          <label htmlFor="resetPass" className="flex items-center gap-2 text-sm text-gray-700">
            <Key className="w-4 h-4" /> Reset password to a new random value
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Link href="/staff" className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</Link>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
