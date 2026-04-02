'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ReportsPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [staffReport, setStaffReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/reports/dashboard'),
      apiFetch('/api/reports/staff'),
    ]).then(([dashRes, staffRes]) => {
      setDashboard(dashRes.data);
      setStaffReport(staffRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 mt-1">Analytics and reporting dashboard</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Staff Distribution by Store</h3>
          {dashboard?.staffByStore?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboard.staffByStore}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="store" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-8">No data</p>}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Staff by Status</h3>
          {staffReport?.byStatus && Object.keys(staffReport.byStatus).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={Object.entries(staffReport.byStatus).map(([status, count]) => ({ status, count }))} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label={({ status, count }) => `${status}: ${count}`}>
                  {Object.keys(staffReport.byStatus).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-8">No data</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Staff by Position</h3>
        {staffReport?.byPosition && Object.keys(staffReport.byPosition).length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(staffReport.byPosition).map(([position, count]) => (
              <div key={position} className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-indigo-600">{count as number}</p>
                <p className="text-sm text-gray-600 mt-1">{position}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-400 text-center py-8">No data</p>}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Key Metrics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-indigo-600">{dashboard?.totalStaff || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Total Staff</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{dashboard?.activeStaff || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Active Staff</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">{dashboard?.attendanceRate || 0}%</p>
            <p className="text-sm text-gray-600 mt-1">Attendance Rate</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{dashboard?.avgPerformance?.toFixed(1) || '0'}</p>
            <p className="text-sm text-gray-600 mt-1">Avg Performance</p>
          </div>
        </div>
      </div>
    </div>
  );
}
