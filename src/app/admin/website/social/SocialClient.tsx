'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { saveSocialLinks } from '@/app/actions/websiteActions';

export default function SocialClient({ initialData }: { initialData: any[] }) {
  const [links, setLinks] = useState<{ platform: string; url: string; id: string }[]>(
    initialData.length > 0 ? initialData : [{ platform: 'Facebook', url: '', id: Date.now().toString() }]
  );
  const [loading, setLoading] = useState(false);

  const platforms = ['Facebook', 'Instagram', 'Twitter', 'YouTube', 'TikTok', 'LinkedIn', 'WhatsApp'];

  const addLink = () => {
    setLinks([...links, { platform: 'Facebook', url: '', id: Date.now().toString() }]);
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  const updateLink = (id: string, field: 'platform' | 'url', value: string) => {
    setLinks(links.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleSave = async () => {
    setLoading(true);
    const validLinks = links.filter(l => l.url.trim() !== '');
    const res = await saveSocialLinks(validLinks);
    setLoading(false);
    
    if (res.success) {
      toast.success('Social links saved');
      setLinks(validLinks.length > 0 ? validLinks : [{ platform: 'Facebook', url: '', id: Date.now().toString() }]);
    } else {
      toast.error(res.error || 'Failed to save links');
    }
  };

  return (
    <div className="p-6 md:p-10 w-full space-y-8 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Social Links</h1>
          <p className="text-gray-500">Manage social media icons and links for your storefront</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        {links.map((link) => (
          <div key={link.id} className="flex items-center gap-4">
            <select 
              value={link.platform} 
              onChange={(e) => updateLink(link.id, 'platform', e.target.value)}
              className="w-1/3 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            >
              {platforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input 
              type="url" 
              value={link.url}
              onChange={(e) => updateLink(link.id, 'url', e.target.value)}
              placeholder="https://..." 
              className="flex-1 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            />
            <button 
              onClick={() => removeLink(link.id)}
              className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        ))}

        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
          <button 
            onClick={addLink}
            className="text-sm font-bold text-gray-700 hover:text-black flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Add Another Link
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="bg-black text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-70"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
