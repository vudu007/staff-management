'use client';

import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { Store } from '@/types';
import { UploadCloud, Search, Package, Store as StoreIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function GlobalInventoryPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>(''); // empty means All Stores
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStoreId, setImportStoreId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadInventory(search);
  }, [selectedStoreId]);

  const loadData = async () => {
    try {
      const storeRes = await apiFetch('/api/stores');
      setStores(storeRes.data || []);
      await loadInventory();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async (searchQuery = '') => {
    try {
      let url = `/api/store-inventory?search=${encodeURIComponent(searchQuery)}&limit=1000`;
      if (selectedStoreId) url += `&storeId=${selectedStoreId}`;
      
      const res = await apiFetch(url);
      setInventory(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadInventory(search);
  };

  const openImportModal = () => {
    setImportStoreId('');
    setShowImportModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // automatically trigger upload if file is selected and store is picked
      if (!importStoreId) {
        alert('Please select a store first');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('storeId', importStoreId);

    try {
       const token = localStorage.getItem('token');
       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/store-inventory/import`, {
         method: 'POST',
         headers: {
           ...(token ? { 'Authorization': `Bearer ${token}` } : {})
         },
         body: formData
       });
       
       const data = await res.json();
       if (!data.success) throw new Error(data.message);
       
       alert(`Import completed! Imported: ${data.imported}, Updated: ${data.updated}`);
       setShowImportModal(false);
       loadInventory(search);
    } catch (err: any) {
       alert(`Import failed: ${err.message}`);
    } finally {
       setUploading(false);
       if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Global Inventory</h1>
          <p className="text-gray-500">Manage stock across all stores</p>
        </div>
        
        <Button onClick={openImportModal} icon={UploadCloud}>
          Import Stock CSV
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
         <div className="flex items-center gap-3 w-full md:w-auto">
            <StoreIcon className="w-5 h-5 text-gray-400" />
            <select 
              value={selectedStoreId} 
              onChange={e => setSelectedStoreId(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full md:w-64 p-2.5 outline-none"
            >
              <option value="">All Stores</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
         </div>
         
         <form onSubmit={handleSearch} className="flex flex-1 max-w-md w-full items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
           <Search className="w-4 h-4 text-gray-400 mr-2" />
           <input 
             value={search}
             onChange={e => setSearch(e.target.value)}
             className="bg-transparent border-none outline-none text-sm w-full" 
             placeholder="Search by Item Name or SKU..." 
           />
         </form>
         <div className="text-sm text-gray-500 hidden lg:block">
           {inventory.length} items found
         </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-sm font-medium text-gray-500 flex items-center gap-2"><Package className="w-4 h-4" /> Item Name</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">SKU</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Location (Store)</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 text-right">Quantity</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Unit</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                     No inventory available. Use 'Import Stock CSV' to add items. format: Item Name, SKU, Quantity, Unit
                  </td>
                </tr>
              ) : (
                inventory.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.itemName}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">{item.sku || '-'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-indigo-600">{item.store?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-right text-gray-900">{item.quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.unit}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Import CSV to Store</h3>
              <button type="button" onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Destination Store</label>
                <select 
                  value={importStoreId} 
                  onChange={e => setImportStoreId(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 outline-none"
                >
                  <option value="">-- Select Store --</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Choose CSV File</label>
                <input 
                  type="file" 
                  accept=".csv" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  disabled={!importStoreId || uploading}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100 disabled:opacity-50"
                 />
                 <p className="text-xs text-gray-400 mt-2">Required Columns: Item Name, SKU, Quantity, Unit</p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 text-right">
                <Button variant="outline" onClick={() => setShowImportModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
