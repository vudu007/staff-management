'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Users, Store, Clock, TrendingUp, Activity, ArrowUpRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="h-3 w-20 bg-gray-200 rounded-md" />
          <div className="h-8 w-16 bg-gray-200 rounded-md" />
          <div className="h-2.5 w-24 bg-gray-200 rounded-md" />
        </div>
        <div className="w-11 h-11 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 p-6 animate-pulse">
      <div className="h-4 w-32 bg-gray-200 rounded-md mb-6" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-end gap-2" style={{ height: `${30 + Math.random() * 40}px` }}>
            <div className="h-full w-full bg-gray-200 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    apiFetch('/api/reports/dashboard')
      .then(res => { setData(res.data as any); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-7 w-64 bg-gray-200 rounded-lg" />
          <div className="h-4 w-96 bg-gray-200 rounded-lg mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-center text-gray-500 py-12">Failed to load dashboard</div>;

  const stats = [
    { label: 'Total Staff', value: data.totalStaff, icon: Users, gradient: 'from-indigo-500 to-indigo-600', change: `${data.activeStaff} active`, trend: 'up' as const },
    { label: 'Stores', value: data.totalStores, icon: Store, gradient: 'from-emerald-500 to-emerald-600', change: 'Locations', trend: 'neutral' as const },
    { label: 'Induction Rate', value: `${data.completionRate}%`, icon: Clock, gradient: 'from-amber-500 to-amber-600', change: `${data.inductionsThisMonth} this month`, trend: 'up' as const },
    { label: 'Avg Performance', value: data.avgPerformance?.toFixed(1) || '0', icon: TrendingUp, gradient: 'from-purple-500 to-purple-600', change: 'Out of 5.0', trend: 'neutral' as const },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-6 text-white">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold">{getGreeting()}, {user?.username || 'Admin'} 👋</h1>
          <p className="text-indigo-200 mt-1 text-sm">Here&apos;s what&apos;s happening with your staff today.</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-full opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-2xl" />
          <div className="absolute bottom-4 right-20 w-24 h-24 bg-white rounded-full blur-xl" />
        </div>
        <div className="absolute top-0 right-0 w-full h-full opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <StatsCard
            key={stat.label}
            label={stat.label}
            value={typeof stat.value === 'number' ? stat.value : 0}
            icon={stat.icon}
            gradient={stat.gradient}
            change={stat.change}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Staff by Store</h3>
              <Link href="/reports" className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition">
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.staffByStore?.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.staffByStore}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="store" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }}
                  />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center py-12 text-sm">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Staff by Status</h3>
              <Link href="/reports" className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition">
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.staffByStatus?.length > 0 ? (
              <div className="flex items-center gap-8">
                <ResponsiveContainer width="55%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.staffByStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      strokeWidth={2}
                      stroke="#fff"
                    >
                      {data.staffByStatus.map((_: any, i: number) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {data.staffByStatus.map((item: any, i: number) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                        <span className="text-sm text-gray-600 capitalize">{item.status.toLowerCase().replace('_', ' ')}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-12 text-sm">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
        </CardHeader>
        <CardContent className="p-0">
          {data.recentActivity?.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {data.recentActivity.map((log: any) => (
                <div key={log.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/80 transition-colors">
                  <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Activity className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">{log.user?.username}</span>
                      {' '}{log.action.toLowerCase()}{' '}
                      <Badge status={log.entityType} size="sm">{log.entityType.toLowerCase()}</Badge>
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap font-medium">
                    {new Date(log.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-12 text-sm">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
