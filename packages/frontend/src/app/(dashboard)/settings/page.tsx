'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Mail, Save, Plus, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const [smtpForm, setSmtpForm] = useState({ name: '', email: '', password: '', server: 'smtp.gmail.com', port: '587', encryption: 'TLS' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSmtpSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await apiFetch('/api/email/smtp-configs', { method: 'POST', body: JSON.stringify(smtpForm) });
      setMessage('SMTP configuration saved successfully');
      setSmtpForm({ name: '', email: '', password: '', server: 'smtp.gmail.com', port: '587', encryption: 'TLS' });
    } catch (err: any) {
      setMessage('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      const recipient = prompt('Enter recipient email:');
      if (!recipient) return;
      await apiFetch('/api/email/send', {
        method: 'POST',
        body: JSON.stringify({ to: recipient, subject: 'Test Email', body: 'This is a test email from Staff Management System.' }),
      });
      setMessage('Test email sent successfully');
    } catch (err: any) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">System configuration and email settings</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Mail className="w-5 h-5" /> SMTP Configuration
        </h3>
        <p className="text-sm text-gray-500 mb-6">Configure email server for sending notifications and reports</p>

        <form onSubmit={handleSmtpSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Configuration Name</label>
              <input required placeholder="e.g., Gmail Work" value={smtpForm.name} onChange={e => setSmtpForm({...smtpForm, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input required type="email" placeholder="you@gmail.com" value={smtpForm.email} onChange={e => setSmtpForm({...smtpForm, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password / App Key</label>
              <input required type="password" value={smtpForm.password} onChange={e => setSmtpForm({...smtpForm, password: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">SMTP Server</label>
              <input required value={smtpForm.server} onChange={e => setSmtpForm({...smtpForm, server: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Port</label>
              <input required value={smtpForm.port} onChange={e => setSmtpForm({...smtpForm, port: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Encryption</label>
              <select value={smtpForm.encryption} onChange={e => setSmtpForm({...smtpForm, encryption: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="TLS">TLS/STARTTLS</option>
                <option value="SSL">SSL</option>
                <option value="NONE">None</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Configuration'}
            </button>
            <button type="button" onClick={handleTestEmail} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              <Mail className="w-4 h-4" /> Send Test Email
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">System Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Backend</span>
            <span className="font-medium">Express.js + PostgreSQL</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Frontend</span>
            <span className="font-medium">Next.js 14</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Environment</span>
            <span className="font-medium capitalize">{process.env.NODE_ENV || 'development'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
