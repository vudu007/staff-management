'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Store } from '@/types';
import { Plus, Edit, Store as StoreIcon } from 'lucide-react';

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', code: '', address: '', city: '', region: '' });

  const loadStores = () => {
    apiFetch('/api/stores')
      .then(res => { setStores(res.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadStores(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await apiFetch(`/api/stores/${editing}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await apiFetch('/api/stores', { method: 'POST', body: JSON.stringify(form) });
      }
      setForm({ name: '', code: '', address: '', city: '', region: '' });
      setShowForm(false);
      setEditing(null);
      loadStores();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (store: Store) => {
    setForm({ name: store.name, code: store.code, address: store.address || '', city: store.city || '', region: store.region || '' });
    setEditing(store.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this store?')) return;
    try {
      await apiFetch(`/api/stores/${id}`, { method: 'DELETE' });
      loadStores();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
          <p className="text-gray-500 mt-1">{stores.length} store locations</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: '', code: '', address: '', city: '', region: '' }); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Add Store
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{editing ? 'Edit Store' : 'New Store'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input required placeholder="Store Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            <input placeholder="Store Code (auto-generated)" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            <input placeholder="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            <input placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            <input placeholder="Region" value={form.region} onChange={e => setForm({...form, region: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-400">Loading...</div>
        ) : stores.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-400">No stores found</div>
        ) : (
          stores.map(store => (
            <div key={store.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <StoreIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{store.name}</h3>
                    <p className="text-xs text-gray-500">{store.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(store)} className="p-1.5 hover:bg-gray-100 rounded"><Edit className="w-4 h-4 text-gray-500" /></button>
                  <button onClick={() => handleDelete(store.id)} className="p-1.5 hover:bg-red-50 rounded"><StoreIcon className="w-4 h-4 text-red-500" /></button>
                </div>
              </div>
              {store.city && <p className="text-sm text-gray-500 mt-3">{store.city}{store.region ? `, ${store.region}` : ''}</p>}
              <p className="text-xs text-gray-400 mt-2">{store._count?.staff || 0} staff members</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
