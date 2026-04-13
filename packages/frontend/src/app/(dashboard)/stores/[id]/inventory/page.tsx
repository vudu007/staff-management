'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Store } from '@/types';
import { ArrowLeft, UploadCloud, Search, Package } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function StoreInventoryPage() {
  const params = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      const storeRes = await apiFetch(`/api/stores/${params.id}`);
      setStore(storeRes.data);
      await loadInventory();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async (searchQuery = '') => {
    try {
      const res = await apiFetch(`/api/store-inventory?storeId=${params.id}&search=${encodeURIComponent(searchQuery)}`);
      setInventory(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadInventory(search);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('storeId', params.id as string);

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
       loadInventory();
    } catch (err: any) {
       alert(`Import failed: ${err.message}`);
    } finally {
       setUploading(false);
       if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  if (!store) return <div className="text-center text-gray-500 py-12">Store not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/stores/${params.id}`} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Store Inventory</h1>
            <p className="text-gray-500">{store.name} - Current Stock</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            icon={UploadCloud} 
            loading={uploading}
          >
            Import CSV
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
         <form onSubmit={handleSearch} className="flex flex-1 max-w-md items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
           <Search className="w-4 h-4 text-gray-400 mr-2" />
           <input 
             value={search}
             onChange={e => setSearch(e.target.value)}
             className="bg-transparent border-none outline-none text-sm w-full" 
             placeholder="Search by Item Name or SKU..." 
           />
         </form>
         <div className="text-sm text-gray-500">
           {inventory.length} items found
         </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-sm font-medium text-gray-500 flex items-center gap-2"><Package className="w-4 h-4" /> Item Name</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">SKU</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500 text-right">Quantity</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Unit</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inventory.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                   No inventory available. Use 'Import CSV' to add items. format: Item Name, SKU, Quantity, Unit
                </td>
              </tr>
            ) : (
              inventory.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.itemName}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">{item.sku || '-'}</td>
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
  );
}
