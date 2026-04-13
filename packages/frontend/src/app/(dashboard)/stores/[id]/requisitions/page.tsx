'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Store } from '@/types';
import { ArrowLeft, CheckCircle, XCircle, FileText, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function StoreRequisitionsPage() {
  const params = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // New Requisition Form state
  const [requesterName, setRequesterName] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<{ inventoryId: string, quantityRequested: number }[]>([]);

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      const [storeRes, reqsRes, invRes] = await Promise.all([
         apiFetch(`/api/stores/${params.id}`),
         apiFetch(`/api/store-requisitions?storeId=${params.id}`),
         apiFetch(`/api/store-inventory?storeId=${params.id}&limit=1000`)
      ]);
      setStore(storeRes.data);
      setRequisitions(reqsRes.data || []);
      setInventory(invRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    if (!confirm(`Are you sure you want to mark this as ${status}?`)) return;
    try {
      await apiFetch(`/api/store-requisitions/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert('Add at least one item');
    setCreating(true);
    try {
      await apiFetch('/api/store-requisitions', {
        method: 'POST',
        body: JSON.stringify({
          storeId: params.id,
          requesterName,
          notes,
          items
        })
      });
      setShowModal(false);
      setRequesterName(''); setNotes(''); setItems([]);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const addItemRow = () => setItems([...items, { inventoryId: '', quantityRequested: 1 }]);
  const updateItemRow = (index: number, field: string, val: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: val };
    setItems(newItems);
  };
  const removeItemRow = (index: number) => setItems(items.filter((_, i) => i !== index));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  if (!store) return <div className="text-center text-gray-500 py-12">Store not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/stores/${params.id}`} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Requisitions</h1>
            <p className="text-gray-500">{store.name} - Material Requests</p>
          </div>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>New Requisition</Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-sm font-medium text-gray-500">ID</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Requester</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Items (Qty)</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Date</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requisitions.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">No requisitions found.</td></tr>
            ) : (
              requisitions.map(req => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">{req.id.slice(-6)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{req.requesterName || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <ul className="list-disc pl-4 space-y-1">
                       {req.items?.map((item: any) => (
                          <li key={item.id}>{item.inventory?.itemName || 'Unknown Item'} ({item.quantityRequested})</li>
                       ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 text-sm">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${req.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' : 
                          req.status === 'FULFILLED' ? 'bg-green-100 text-green-800' : 
                          req.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                       {req.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                     {req.status === 'PENDING' && (
                        <>
                           <button onClick={() => handleStatusChange(req.id, 'APPROVED')} className="text-blue-600 hover:text-blue-800">Approve</button>
                           <button onClick={() => handleStatusChange(req.id, 'REJECTED')} className="text-red-600 hover:text-red-800">Reject</button>
                        </>
                     )}
                     {req.status === 'APPROVED' && (
                        <button onClick={() => handleStatusChange(req.id, 'FULFILLED')} className="text-green-600 font-bold hover:text-green-800">Fulfill (Deplete Stock)</button>
                     )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">New Requisition</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-5 overflow-y-auto">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Requester Name</label>
                    <input required value={requesterName} onChange={e => setRequesterName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                    <input value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                 </div>
               </div>

               <div>
                 <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Requested Items</label>
                    <button type="button" onClick={addItemRow} className="text-sm text-indigo-600 font-medium hover:text-indigo-800">+ Add Item</button>
                 </div>
                 <div className="space-y-3">
                    {items.map((it, idx) => (
                       <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <select required value={it.inventoryId} onChange={e => updateItemRow(idx, 'inventoryId', e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm outline-none">
                             <option value="">Select Item...</option>
                             {inventory.map(inv => <option key={inv.id} value={inv.id}>{inv.itemName} ({inv.quantity} {inv.unit} in stock)</option>)}
                          </select>
                          <input required type="number" min="1" placeholder="Qty" value={it.quantityRequested} onChange={e => updateItemRow(idx, 'quantityRequested', parseInt(e.target.value))} className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm outline-none" />
                          <button type="button" onClick={() => removeItemRow(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-md"><X className="w-4 h-4" /></button>
                       </div>
                    ))}
                    {items.length === 0 && <p className="text-sm text-gray-500 italic">No items added. Click + Add Item.</p>}
                 </div>
               </div>

               <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                 <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                 <button type="submit" disabled={creating} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
                    <CheckCircle className="w-4 h-4" /> {creating ? 'Saving...' : 'Submit Requisition'}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
