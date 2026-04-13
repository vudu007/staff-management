'use client';

import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { Store } from '@/types';
import { Plus, Edit, Store as StoreIcon, Download, Upload } from 'lucide-react';

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', code: '', address: '', city: '', region: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadStores = () => {
    apiFetch('/api/stores')
      .then(res => { setStores(res.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { loadStores(); }, []);

  const handleExport = () => {
    if (stores.length === 0) return alert('No stores to export');
    const headers = ['id', 'name', 'code', 'address', 'city', 'region'];
    const csvContent = [
      headers.join(','),
      ...stores.map(store => [
        store.id,
        `"${store.name}"`,
        `"${store.code}"`,
        `"${store.address || ''}"`,
        `"${store.city || ''}"`,
        `"${store.region || ''}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'stores_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      
      const rows = text.split('\n');
      const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      
      let importedCount = 0;
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue;
        const values = rows[i].split(',').map(val => val.trim().replace(/^"|"$/g, ''));
        const storeData: any = {};
        headers.forEach((h, index) => {
          storeData[h] = values[index];
        });
        
        try {
          if (storeData.name) {
            await apiFetch('/api/stores', { method: 'POST', body: JSON.stringify({
              name: storeData.name,
              code: storeData.code || '',
              address: storeData.address || '',
              city: storeData.city || '',
              region: storeData.region || ''
            })});
            importedCount++;
          }
        } catch (err) {
          console.error(`Failed to import store ${storeData.name}`, err);
        }
      }
      alert(`Successfully imported ${importedCount} stores!`);
      loadStores();
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
        <div className="flex items-center gap-2">
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImport} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            <Upload className="w-4 h-4" /> Import Stores
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export Stores
          </button>
          <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: '', code: '', address: '', city: '', region: '' }); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> Add Store
          </button>
        </div>
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
