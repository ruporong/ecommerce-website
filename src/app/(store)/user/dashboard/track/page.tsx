'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import TrackingTimeline from '@/components/TrackingTimeline';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialId = searchParams.get('id') || '';
  const [orderId, setOrderId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  // Auto-fetch if ID is present in URL
  useState(() => {
    if (initialId) {
      handleTrack(initialId);
    }
  });

  async function handleTrack(idToTrack: string) {
    if (!idToTrack) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`/api/track-order?id=${encodeURIComponent(idToTrack)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to track order');
      } else {
        setResult(data.order);
        // Update URL silently
        if (idToTrack !== initialId) {
          router.replace(`/user/dashboard/track?id=${encodeURIComponent(idToTrack)}`);
        }
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-full max-w-3xl">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Track Your Parcel</h1>
          <p className="text-gray-500 mt-2">Enter your order ID below to see the current delivery status.</p>
        </div>

        <form 
          onSubmit={(e) => { e.preventDefault(); handleTrack(orderId); }}
          className="relative max-w-md mx-auto mb-10"
        >
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. ORD-510824 or 510824"
            className="w-full pl-5 pr-32 py-4 bg-gray-50 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 px-6 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-70 transition-colors"
          >
            {loading ? 'Tracking...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center border border-red-100 font-medium">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-2">
              <div>
                <p className="text-gray-500 text-sm font-medium">Order Status</p>
                <h2 className="text-2xl font-bold text-gray-900 capitalize">{result.status}</h2>
              </div>
              <div className="text-left sm:text-right">
                {result.createdAt && (
                  <p className="text-gray-500 text-sm">Placed on: <span className="font-semibold text-gray-900">{new Date(result.createdAt).toLocaleDateString()}</span></p>
                )}
                {result.customer_name && (
                  <p className="text-gray-500 text-sm">Customer: <span className="font-semibold text-gray-900">{result.customer_name}</span></p>
                )}
              </div>
            </div>

            <TrackingTimeline 
              status={result.status} 
              courierProvider={result.courier_provider}
              courierStatus={result.courier_status}
              courierConsignmentId={result.courier_consignment_id}
            />
          </div>
        )}

      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
