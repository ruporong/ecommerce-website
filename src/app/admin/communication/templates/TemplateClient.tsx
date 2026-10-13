'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function TemplateClient({ templates: initial }: { templates: any[] }) {
  const [templates, setTemplates] = useState(initial);
  const [editing, setEditing] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', subject: '', body_html: '' });

  const openNew = () => {
    setEditing(null);
    setFormData({ name: '', subject: '', body_html: '' });
    setIsModalOpen(true);
  };

  const openEdit = (t: any) => {
    setEditing(t);
    setFormData({ name: t.name, subject: t.subject, body_html: t.body_html });
    setIsModalOpen(true);
  };

  const saveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editing ? `/api/admin/communication/templates/${editing._id}` : '/api/admin/communication/templates';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(editing ? 'Updated' : 'Created');
        if (editing) {
          setTemplates(templates.map(t => t._id === editing._id ? data.template : t));
        } else {
          setTemplates([data.template, ...templates]);
        }
        setIsModalOpen(false);
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error('Failed to save template');
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      const res = await fetch(`/api/admin/communication/templates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTemplates(templates.filter(t => t._id !== id));
        toast.success('Deleted');
      }
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <span className="font-medium text-gray-700">All Templates</span>
          <button onClick={openNew} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors shadow-sm">Create New</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-xs tracking-wider text-gray-500 uppercase">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Subject</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map(t => (
                <tr key={t._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4 text-gray-900 font-medium">{t.name}</td>
                  <td className="p-4 text-gray-500 text-sm">{t.subject}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEdit(t)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium mr-4">Edit</button>
                    <button onClick={() => deleteTemplate(t._id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                  </td>
                </tr>
              ))}
              {templates.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-400">No templates found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editing ? 'Edit Template' : 'New Template'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={saveTemplate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Internal Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="e.g. Welcome Email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
                <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="e.g. Welcome to ÉLANE" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HTML Body</label>
                <textarea required rows={8} value={formData.body_html} onChange={e => setFormData({...formData, body_html: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-sm" placeholder="<h1>Hello</h1>" />
                <p className="text-xs text-gray-500 mt-1">You can use basic HTML like &lt;h1&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;a href="..."&gt; etc.</p>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
