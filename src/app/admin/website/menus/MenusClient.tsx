'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { createMenu, deleteMenu } from '@/app/actions/websiteActions';

export default function MenusClient({ initialData, position }: { initialData: any[], position: string }) {
  const [menus, setMenus] = useState(initialData);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('position', position);
    
    const res = await createMenu(formData);
    setLoading(false);
    
    if (res.success) {
      toast.success('Menu link added');
      setMenus([...menus, res.data].sort((a, b) => {
        if (position === 'footer') {
          if (a.column !== b.column) return a.column - b.column;
        }
        return a.order - b.order;
      }));
      setIsAdding(false);
    } else {
      toast.error(res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    const res = await deleteMenu(id, position);
    if (res.success) {
      toast.success('Menu link deleted');
      setMenus(menus.filter(m => m._id !== id));
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="p-6 md:p-10 w-full space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold capitalize">{position} Menu</h1>
          <p className="text-gray-500">Manage navigation links</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="bg-black text-white px-5 py-2 rounded-xl font-semibold">
          {isAdding ? 'Cancel' : 'Add Link'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Display Name *</label>
            <input name="name" required className="w-full border rounded-lg px-4 py-2" placeholder="e.g. About Us" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">URL / Link *</label>
            <input name="link" required className="w-full border rounded-lg px-4 py-2" placeholder="/about" />
          </div>
          {position === 'footer' && (
            <div>
              <label className="block text-sm font-semibold mb-1">Footer Column</label>
              <select name="column" className="w-full border rounded-lg px-4 py-2">
                <option value="1">Column 1 (Company)</option>
                <option value="2">Column 2 (Help)</option>
                <option value="3">Column 3 (Policies)</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold mb-1">Order</label>
            <input name="order" type="number" defaultValue="0" className="w-full border rounded-lg px-4 py-2" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button disabled={loading} className="bg-black text-white px-6 py-2 rounded-lg font-bold">
              {loading ? 'Saving...' : 'Save Link'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Link</th>
              {position === 'footer' && <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Column</th>}
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Order</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {menus.map(menu => (
              <tr key={menu._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold">{menu.name}</td>
                <td className="px-6 py-4 text-gray-500 text-sm">{menu.link}</td>
                {position === 'footer' && <td className="px-6 py-4 text-sm">Col {menu.column}</td>}
                <td className="px-6 py-4 text-sm">{menu.order}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(menu._id)} className="text-red-500 font-bold hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
