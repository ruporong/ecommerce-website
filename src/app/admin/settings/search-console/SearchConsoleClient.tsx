'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { saveSettings } from '@/app/actions/settingsActions';

export default function SearchConsoleClient({ initialData }: { initialData: Record<string, string> }) {
  const [savingForm, setSavingForm] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>, formName: string) => {
    e.preventDefault();
    setSavingForm(formName);
    
    const formData = new FormData(e.currentTarget);

    try {
      const result = await saveSettings(formData, '/admin/settings/search-console');
      if (result.success) toast.success('Settings saved successfully!');
      else toast.error(result.error || 'Failed to save settings.');
    } catch (error) {
      toast.error('An error occurred.');
    } finally {
      setSavingForm(null);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Google Search Console</h1>
        <p className="text-sm text-gray-500 mt-2">Verify and manage your domain ownership and analytics tracking.</p>
      </div>

      <div className="max-w-2xl items-start">
        {/* Verification */}
        <form onSubmit={(e) => handleSave(e, 'verification')} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">Verification</h2>
          </div>
          
          <div className="p-6 flex-grow flex flex-col">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Google Site Verification Code</label>
            <p className="text-xs text-gray-400 mb-3">Paste the content of the HTML tag provided by Google.</p>
            <textarea 
              name="google_site_verification" 
              defaultValue={initialData.google_site_verification || ''}
              rows={4}
              placeholder='<meta name="google-site-verification" content="..." />'
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none text-sm font-mono flex-grow resize-none"
            />
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end mt-auto">
            <button type="submit" disabled={savingForm === 'verification'} className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
              {savingForm === 'verification' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
