'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { createPage, deletePage } from '@/app/actions/websiteActions';

export default function PagesClient({ initialData }: { initialData: any[] }) {
  const [pages, setPages] = useState(initialData);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createPage(formData);
    setLoading(false);
    
    if (res.success) {
      toast.success('Page added');
      setPages([res.data, ...pages]);
      setIsAdding(false);
    } else {
      toast.error(res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    const res = await deletePage(id);
    if (res.success) {
      toast.success('Page deleted');
      setPages(pages.filter(p => p._id !== id));
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="p-6 md:p-10 w-full space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dynamic Pages</h1>
          <p className="text-gray-500">Manage About Us, Privacy Policy, Terms, etc.</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="bg-black text-white px-5 py-2 rounded-xl font-semibold">
          {isAdding ? 'Cancel' : 'Add Page'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Page Title *</label>
              <input name="title" required className="w-full border rounded-lg px-4 py-2" placeholder="e.g. Privacy Policy" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Slug / URL path *</label>
              <input name="slug" required className="w-full border rounded-lg px-4 py-2" placeholder="e.g. privacy-policy" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Content (HTML allowed)</label>
            <textarea name="content" rows={10} className="w-full border rounded-lg px-4 py-2" placeholder="<h1>Privacy Policy</h1><p>Your content here...</p>"></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Meta Title (SEO)</label>
              <input name="meta_title" className="w-full border rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Meta Description (SEO)</label>
              <input name="meta_description" className="w-full border rounded-lg px-4 py-2" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button disabled={loading} className="bg-black text-white px-6 py-2 rounded-lg font-bold">
              {loading ? 'Saving...' : 'Save Page'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {pages.map(page => (
          <div key={page._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{page.title}</h3>
              <p className="text-sm text-gray-500">/{page.slug}</p>
            </div>
            <div className="flex items-center gap-4">
              <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm font-bold hover:underline">View</a>
              <button onClick={() => handleDelete(page._id)} className="text-red-500 text-sm font-bold hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
