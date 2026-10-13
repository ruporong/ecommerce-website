'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function BroadcastMessageClient() {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const sendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Broadcast sent successfully!');
        setTitle('');
        setBody('');
      } else {
        toast.error(data.error || 'Failed to send broadcast');
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Send Broadcast Message</h2>
            <p className="text-sm text-gray-500 mt-1">Send a custom push notification to all subscribed users immediately.</p>
          </div>
        </div>
      </div>
      
      <form onSubmit={sendBroadcast} className="p-6">
        <div className="space-y-6 max-w-3xl">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notification Title</label>
            <input 
              type="text" 
              required 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none font-medium text-gray-900 placeholder-gray-300 transition-all" 
              placeholder="e.g. Flash Sale Alert! ⚡" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notification Body</label>
            <textarea 
              required 
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4} 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none text-sm text-gray-700 placeholder-gray-300 transition-all resize-none" 
              placeholder="e.g. Get 50% off on all items for the next 2 hours." 
            />
          </div>
        </div>
      </form>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
        <button 
          type="button"
          onClick={sendBroadcast}
          disabled={loading || !title || !body}
          className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Sending...</>
          ) : (
            <>Send Broadcast Now</>
          )}
        </button>
      </div>
    </div>
  );
}
