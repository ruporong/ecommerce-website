"use client";

import { useState } from "react";
import { bookSteadfastCourier } from "@/app/actions/steadfastActions";
import { bookPathaoCourier } from "@/app/actions/pathaoActions";
import toast from "react-hot-toast";

export default function BookCourierButton({ orderId, status, consignmentId }: { orderId: string, status: string | null, consignmentId: string | null }) {
  const [loading, setLoading] = useState(false);
  const [courier, setCourier] = useState<'steadfast' | 'pathao'>('steadfast');

  const handleBook = async () => {
    setLoading(true);
    
    let res: any;
    if (courier === 'steadfast') {
      res = await bookSteadfastCourier(orderId);
    } else {
      res = await bookPathaoCourier(orderId);
    }
    
    if (!res.success) {
      toast.error(res.error || "Failed to book courier");
    } else {
      toast.success(res.warning ? res.warning : `Successfully booked via ${courier === 'steadfast' ? 'Steadfast' : 'Pathao'}`);
    }
    setLoading(false);
  };

  if (consignmentId) {
    return (
      <div className="text-[11px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 rounded px-2 py-1.5 flex flex-col gap-1 items-center">
        <span className="uppercase text-[9px] text-indigo-400 tracking-wider">Tracking ID</span>
        <span>{consignmentId}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <select 
        value={courier} 
        onChange={(e) => setCourier(e.target.value as any)}
        className="w-full text-[11px] border-gray-200 rounded px-2 py-1 focus:border-black focus:ring-0 text-gray-700 bg-gray-50 font-medium"
      >
        <option value="steadfast">Steadfast Courier</option>
        <option value="pathao">Pathao Courier</option>
      </select>
      <button 
        onClick={handleBook}
        disabled={loading}
        className="w-full bg-[#5B4AE0] hover:bg-[#4a3bc2] disabled:bg-gray-400 text-white text-[11px] py-1.5 px-2 rounded font-semibold uppercase transition-colors flex items-center justify-center gap-1.5 shadow-sm"
      >
        {loading ? (
          <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        ) : null}
        {loading ? 'Booking...' : 'Book Courier'}
      </button>
    </div>
  );
}
