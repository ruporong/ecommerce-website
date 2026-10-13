'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ContactClient({ messages: initialMessages }: { messages: any[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [selectedMsg, setSelectedMsg] = useState<any>(null);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/communication/contact/${id}`, { method: 'PATCH' });
      if (res.ok) {
        setMessages(messages.map(m => m._id === id ? { ...m, status: 'read' } : m));
        if (selectedMsg && selectedMsg._id === id) {
          setSelectedMsg({ ...selectedMsg, status: 'read' });
        }
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const deleteMsg = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      const res = await fetch(`/api/admin/communication/contact/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages(messages.filter(m => m._id !== id));
        if (selectedMsg && selectedMsg._id === id) setSelectedMsg(null);
        toast.success('Deleted');
      }
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 bg-white border border-gray-200 rounded-xl overflow-hidden h-[600px] flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50 font-medium">Inbox ({messages.length})</div>
        <div className="overflow-y-auto flex-1">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No messages found</div>
          ) : (
            messages.map((m) => (
              <div 
                key={m._id} 
                onClick={() => { setSelectedMsg(m); if (m.status === 'unread') markAsRead(m._id); }}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${selectedMsg?._id === m._id ? 'bg-indigo-50' : 'hover:bg-gray-50'} ${m.status === 'unread' ? 'font-semibold text-gray-900' : 'text-gray-600'}`}
              >
                <div className="flex justify-between mb-1">
                  <div className="truncate pr-4">{m.name}</div>
                  <div className="text-xs text-gray-400 whitespace-nowrap">{new Date(m.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-sm truncate">{m.subject}</div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-6 h-[600px] overflow-y-auto">
        {selectedMsg ? (
          <div>
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold mb-1">{selectedMsg.subject}</h2>
                <div className="text-sm text-gray-500">From: <a href={`mailto:${selectedMsg.email}`} className="text-indigo-600 hover:underline">{selectedMsg.name} &lt;{selectedMsg.email}&gt;</a></div>
                <div className="text-xs text-gray-400 mt-1">{new Date(selectedMsg.createdAt).toLocaleString()}</div>
              </div>
              <button onClick={() => deleteMsg(selectedMsg._id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
            </div>
            <div className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed">
              {selectedMsg.message}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100">
              <a href={`mailto:${selectedMsg.email}?subject=Re: ${selectedMsg.subject}`} className="inline-flex px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800">Reply via Email</a>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Select a message to read
          </div>
        )}
      </div>
    </div>
  );
}
