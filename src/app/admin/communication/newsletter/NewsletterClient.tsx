'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function NewsletterClient({ subscribers: initial }: { subscribers: any[] }) {
  const [subscribers, setSubscribers] = useState(initial);

  const deleteSub = async (id: string) => {
    if (!confirm('Remove subscriber?')) return;
    try {
      const res = await fetch(`/api/admin/communication/newsletter/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubscribers(subscribers.filter(s => s._id !== id));
        toast.success('Removed');
      }
    } catch (e) {
      toast.error('Failed to remove');
    }
  };

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Email,Date Subscribed\n" 
      + subscribers.map(s => `${s.email},${new Date(s.subscribedAt).toISOString()}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "subscribers.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <span className="font-medium text-gray-700">Total: {subscribers.length}</span>
        <button onClick={exportCSV} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors shadow-sm">Export CSV</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-100 text-xs tracking-wider text-gray-500 uppercase">
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Subscribed Date</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map(s => (
              <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="p-4 text-gray-900 font-medium">{s.email}</td>
                <td className="p-4 text-gray-500 text-sm">{new Date(s.subscribedAt).toLocaleString()}</td>
                <td className="p-4 text-right">
                  <button onClick={() => deleteSub(s._id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-400">No subscribers yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
