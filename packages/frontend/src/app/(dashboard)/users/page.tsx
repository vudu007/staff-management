'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { User as UserType } from '@/types';
import { Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ username: '', password: '', role: 'VIEWER', email: '', isActive: true });

  const loadUsers = () => {
    apiFetch('/api/users')
      .then(res => { setUsers(res.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await apiFetch(`/api/users/${editing}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await apiFetch('/api/users', { method: 'POST', body: JSON.stringify(form) });
      }
      setForm({ username: '', password: '', role: 'VIEWER', email: '', isActive: true });
      setShowForm(false);
      setEditing(null);
      loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (user: UserType) => {
    setForm({ username: user.username, password: '', role: user.role, email: user.email || '', isActive: user.isActive !== false });
    setEditing(user.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try {
      await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
      loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-red-100 text-red-700',
    ADMIN: 'bg-purple-100 text-purple-700',
    MANAGER: 'bg-blue-100 text-blue-700',
    VIEWER: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage system users and permissions</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ username: '', password: '', role: 'VIEWER', email: '', isActive: true }); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{editing ? 'Edit User' : 'New User'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input required placeholder="Username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} readOnly={!!editing} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            <input type="password" placeholder={editing ? 'Leave blank to keep current' : 'Password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="VIEWER">Viewer</option>
            </select>
            <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Username</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No users found</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{u.username}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.email || '-'}</td>
                  <td className="px-4 py-3"><span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${roleColors[u.role]}`}>{u.role}</span></td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-sm ${u.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {u.isActive ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(u)} className="p-1.5 hover:bg-gray-100 rounded"><Edit className="w-4 h-4 text-gray-500" /></button>
                      <button onClick={() => handleDelete(u.id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
