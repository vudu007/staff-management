'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Store, Staff, StoreAnalytics } from '@/types';
import { StatsCard } from '@/components/ui/StatsCard';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft, Users, UserCheck, Clock, TrendingUp, Edit, Save, X,
  MapPin, Hash, Globe
} from 'lucide-react';
import Link from 'next/link';

export default function StoreDetailPage() {
  const params = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [analytics, setAnalytics] = useState<StoreAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', address: '', city: '', region: '' });

  useEffect(() => {
    Promise.all([
      apiFetch(`/api/stores/${params.id}`),
      apiFetch(`/api/stores/${params.id}/staff`),
      apiFetch(`/api/stores/${params.id}/analytics`),
    ]).then(([storeRes, staffRes, analyticsRes]) => {
      const s = storeRes.data as any;
      setStore(s);
      setStaff((staffRes.data as any) || []);
      setAnalytics(analyticsRes.data as any);
      setForm({
        name: s?.name || '', code: s?.code || '',
        address: s?.address || '', city: s?.city || '', region: s?.region || '',
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiFetch(`/api/stores/${params.id}`, {
        method: 'PUT', body: JSON.stringify(form),
      });
      setStore(res.data as any);
      setEditing(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!store) {
    return <div className="text-center text-gray-500 py-12">Store not found</div>;
  }

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-700',
    ON_LEAVE: 'bg-amber-50 text-amber-700',
    TERMINATED: 'bg-red-50 text-red-700',
    SUSPENDED: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/stores" className="p-2 hover:bg-gray-100 rounded-xl transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            {editing ? (
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="text-2xl font-bold text-gray-900 border-b-2 border-indigo-500 outline-none bg-transparent"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
            )}
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Hash className="w-3.5 h-3.5" /> {store.code}
              </span>
              {store.city && (
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="w-3.5 h-3.5" /> {store.city}{store.region ? `, ${store.region}` : ''}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button variant="outline" size="sm" icon={X} onClick={() => setEditing(false)}>Cancel</Button>
              <Button size="sm" icon={Save} loading={saving} onClick={handleSave}>Save</Button>
            </>
          ) : (
            <>
              <Link href={`/stores/${params.id}/inventory`}>
                 <Button variant="outline" size="sm" icon={Globe}>Inventory</Button>
              </Link>
              <Link href={`/stores/${params.id}/requisitions`}>
                 <Button variant="outline" size="sm" icon={Globe}>Requisitions</Button>
              </Link>
              <Button variant="outline" size="sm" icon={Edit} onClick={() => setEditing(true)}>Edit Store</Button>
            </>
          )}
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <Card>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="Street address"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                placeholder="City"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Region</label>
              <input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}
                placeholder="Region/State"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Total Staff" value={analytics.totalStaff} icon={Users} gradient="from-indigo-500 to-indigo-600" change={`${analytics.activeStaff} active`} />
          <StatsCard label="Active Staff" value={analytics.activeStaff} icon={UserCheck} gradient="from-emerald-500 to-emerald-600" change={`${analytics.inactiveStaff} inactive`} />
          <StatsCard label="Attendance (Month)" value={analytics.attendanceThisMonth} icon={Clock} gradient="from-amber-500 to-amber-600" change="This month" />
          <StatsCard label="Avg Performance" value={analytics.avgPerformance?.toFixed?.(1) || '0'} icon={TrendingUp} gradient="from-purple-500 to-purple-600" change="Out of 5.0" />
        </div>
      )}

      {/* Staff List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Staff Members</h3>
              <p className="text-sm text-gray-500 mt-0.5">{staff.length} staff at this store</p>
            </div>
            <Link href="/staff/new">
              <Button size="sm" icon={Users}>Add Staff</Button>
            </Link>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/80">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Staff ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Position</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No staff at this store</td></tr>
              ) : (
                staff.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{s.staffId}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.firstName} {s.lastName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.position}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <Badge status={s.status} dot>{s.status.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/staff/${s.id}`} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
