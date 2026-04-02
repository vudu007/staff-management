'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { PerformanceReview, Staff, Store } from '@/types';
import { TrendingUp, Star, Plus } from 'lucide-react';

export default function PerformancePage() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ staffId: '', score: '3', category: 'OVERALL', comments: '', reviewDate: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    Promise.all([
      apiFetch('/api/performance/summary'),
      apiFetch('/api/staff?limit=100'),
      apiFetch('/api/stores'),
    ]).then(([sumRes, staffRes, storesRes]) => {
      setSummary(sumRes.data);
      setStaff(staffRes.data?.data || []);
      setStores(storesRes.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/performance', { method: 'POST', body: JSON.stringify(form) });
      setForm({ staffId: '', score: '3', category: 'OVERALL', comments: '', reviewDate: new Date().toISOString().split('T')[0] });
      setShowForm(false);
      const res = await apiFetch('/api/performance/summary');
      setSummary(res.data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const categoryColors: Record<string, string> = {
    PUNCTUALITY: 'bg-blue-100 text-blue-700',
    CUSTOMER_SERVICE: 'bg-green-100 text-green-700',
    SALES: 'bg-purple-100 text-purple-700',
    TEAMWORK: 'bg-amber-100 text-amber-700',
    OVERALL: 'bg-indigo-100 text-indigo-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance</h1>
          <p className="text-gray-500 mt-1">Staff performance reviews and ratings</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Add Review
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Total Reviews</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{summary.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Average Score</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-3xl font-bold text-gray-900">{summary.avgScore?.toFixed(1) || '0'}</p>
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">By Category</p>
            <div className="space-y-2 mt-2">
              {summary.byCategory?.map((c: any) => (
                <div key={c.category} className="flex items-center justify-between text-sm">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${categoryColors[c.category]}`}>{c.category}</span>
                  <span className="font-medium">{c.avgScore?.toFixed(1)} ({c.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">New Performance Review</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select required value={form.staffId} onChange={e => setForm({...form, staffId: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Select Staff</option>
              {staff.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.staffId})</option>)}
            </select>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              {['OVERALL', 'PUNCTUALITY', 'CUSTOMER_SERVICE', 'SALES', 'TEAMWORK'].map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
            <input type="number" min="1" max="5" value={form.score} onChange={e => setForm({...form, score: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="date" value={form.reviewDate} onChange={e => setForm({...form, reviewDate: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <textarea placeholder="Comments" value={form.comments} onChange={e => setForm({...form, comments: e.target.value})} className="sm:col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={3} />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Submit Review</button>
          </div>
        </form>
      )}
    </div>
  );
}
