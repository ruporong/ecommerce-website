'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function BroadcastClient({ templates }: { templates: any[] }) {
  const [target, setTarget] = useState('subscribers');
  const [specificEmail, setSpecificEmail] = useState('');
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [sending, setSending] = useState(false);

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    const t = templates.find(t => t._id === id);
    if (t) {
      setSubject(t.subject);
      setBodyHtml(t.body_html);
    } else {
      setSubject('');
      setBodyHtml('');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to send this broadcast?')) return;
    setSending(true);
    
    try {
      const res = await fetch('/api/admin/communication/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, specificEmail, subject, bodyHtml })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Emails sent successfully! Target count: ${data.count}`);
      } else {
        toast.error(data.error || 'Failed to send broadcast');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm max-w-4xl">
      <form onSubmit={handleSend} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
            <select 
              value={target} 
              onChange={e => setTarget(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="subscribers">Newsletter Subscribers</option>
              <option value="users">All Registered Users</option>
              <option value="specific">Specific Email Address</option>
            </select>
          </div>
          
          {target === 'specific' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specific Email</label>
              <input 
                type="email" 
                required 
                value={specificEmail} 
                onChange={e => setSpecificEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <input 
              type="checkbox" 
              id="useTemplate" 
              checked={useTemplate} 
              onChange={e => setUseTemplate(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-gray-300"
            />
            <label htmlFor="useTemplate" className="text-sm font-medium text-gray-700">Use Saved Template</label>
          </div>

          {useTemplate && (
            <div className="mb-4">
              <select 
                value={selectedTemplateId} 
                onChange={e => handleTemplateChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Select a template...</option>
                {templates.map(t => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
              <input 
                type="text" 
                required 
                value={subject} 
                onChange={e => setSubject(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HTML Body</label>
              <textarea 
                required 
                rows={10} 
                value={bodyHtml} 
                onChange={e => setBodyHtml(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button 
            type="submit" 
            disabled={sending}
            className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send Broadcast'}
          </button>
        </div>
      </form>
    </div>
  );
}
