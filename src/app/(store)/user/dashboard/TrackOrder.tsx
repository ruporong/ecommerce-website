"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TrackOrder() {
  const router = useRouter();
  const [orderId, setOrderId] = useState('');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    let formattedId = orderId.trim().replace(/^#/, '');
    if (/^\d+$/.test(formattedId)) {
      formattedId = `ORD-${formattedId}`;
    }
    router.push(`/user/dashboard/track?id=${encodeURIComponent(formattedId)}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mt-8">
      <h2 className="text-lg font-bold text-gray-900 mb-2">Track Parcel</h2>
      <p className="text-gray-500 text-sm mb-6">Enter your Order ID to check the current delivery status.</p>
      
      <form onSubmit={handleTrack} className="flex gap-4">
        <input 
          type="text" 
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="e.g. ORD-123456 or 123456" 
          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-black outline-none transition-shadow"
          required
        />
        <button 
          type="submit" 
          className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors whitespace-nowrap"
        >
          Track
        </button>
      </form>
    </div>
  );
}