'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Staff, Store } from '@/types';
import { Plus, Search, Filter, Download, Upload, Trash2, Edit, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [storeId, setStoreId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    apiFetch('/api/stores')
      .then(res => setStores(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: '20',
      ...(search && { search }),
      ...(storeId && { storeId }),
      ...(status && { status }),
    });

    apiFetch(`/api/staff?${params}`)
      .then(res => {
        setStaff(res.data?.data || []);
        setTotalPages(res.data?.pagination?.totalPages || 1);
        setTotal(res.data?.pagination?.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, storeId, status, page]);

  const handleExport = () => {
    const params = new URLSearchParams({
      ...(storeId && { storeId }),
      ...(status && { status }),
    });
    window.open(`/api/staff/export?${params}`, '_blank');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_BASE}/api/staff/import`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        body: formData,
      });
      const data = await res.json();
      alert(`Imported: ${data.data?.imported || 0}, Updated: ${data.data?.updated || 0}`);
      setShowImport(false);
      setPage(1);
    } catch (err: any) {
      alert('Import failed: ' + err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.length} staff members?`)) return;
    try {
      await apiFetch('/api/staff/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids: selected }),
      });
      setSelected([]);
      setPage(1);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelected(prev => prev.length === staff.length ? [] : staff.map(s => s.id));
  };

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    ON_LEAVE: 'bg-yellow-100 text-yellow-700',
    TERMINATED: 'bg-red-100 text-red-700',
    SUSPENDED: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <p className="text-gray-500 mt-1">{total} total staff members</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowImport(!showImport)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">
            <Upload className="w-4 h-4" /> Import
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">
            <Download className="w-4 h-4" /> Export
          </button>
          <Link href="/staff/new" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition">
            <Plus className="w-4 h-4" /> Add Staff
          </Link>
        </div>
      </div>

      {showImport && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Import Staff from CSV</h3>
          <p className="text-sm text-gray-500 mb-4">Columns: Store, ID, First Name, Last Name, Position, Phone, Email</p>
          <input type="file" accept=".csv" onChange={handleImport} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <select
            value={storeId}
            onChange={e => { setStoreId(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">All Stores</option>
            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="TERMINATED">Terminated</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          {selected.length > 0 && (
            <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
              <Trash2 className="w-4 h-4" /> Delete ({selected.length})
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={selected.length === staff.length && staff.length > 0} onChange={toggleAll} className="rounded" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Staff ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Position</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Store</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : staff.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No staff found</td></tr>
              ) : (
                staff.map(s => (
                  <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggleSelect(s.id)} className="rounded" />
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{s.staffId}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.firstName} {s.lastName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.position}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.store?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[s.status] || 'bg-gray-100 text-gray-700'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/staff/${s.id}`} className="p-1.5 hover:bg-gray-100 rounded">
                          <Eye className="w-4 h-4 text-gray-500" />
                        </Link>
                        <Link href={`/staff/${s.id}`} className="p-1.5 hover:bg-gray-100 rounded">
                          <Edit className="w-4 h-4 text-gray-500" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 hover:bg-gray-100 rounded disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 hover:bg-gray-100 rounded disabled:opacity-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
