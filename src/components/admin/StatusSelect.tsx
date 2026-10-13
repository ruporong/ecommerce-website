"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/app/actions/orderActions";

const statuses = [
  { value: "pending", label: "Pending", color: "bg-orange-50 text-orange-800 border-orange-200" },
  { value: "confirmed", label: "Confirmed", color: "bg-sky-50 text-sky-800 border-sky-200" },
  { value: "processing", label: "Processing", color: "bg-blue-50 text-blue-800 border-blue-200" },
  { value: "ready_to_ship", label: "Ready to Ship", color: "bg-indigo-50 text-indigo-800 border-indigo-200" },
  { value: "in_courier", label: "In Courier", color: "bg-purple-50 text-purple-800 border-purple-200" },
  { value: "delivered", label: "Delivered", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-50 text-red-800 border-red-200" },
  { value: "returned", label: "Returned", color: "bg-rose-50 text-rose-800 border-rose-200" },
  { value: "refunded", label: "Refunded", color: "bg-gray-100 text-gray-800 border-gray-300" }
];

export default function StatusSelect({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus || 'pending');
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setLoading(true);
    
    await updateOrderStatus(orderId, newStatus);
    
    setLoading(false);
  };

  const currentColor = statuses.find(s => s.value === status)?.color || "bg-gray-50 text-gray-800 border-gray-200";

  return (
    <div className="relative inline-block w-full min-w-[140px]">
      <select 
        value={status}
        onChange={handleChange}
        disabled={loading}
        className={`appearance-none border rounded-md py-1.5 pl-3 pr-8 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-black w-full cursor-pointer transition-colors shadow-sm ${currentColor}`}
      >
        {statuses.map(s => (
          <option key={s.value} value={s.value} className="bg-white text-gray-900">{s.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
        <svg className="fill-current h-4 w-4 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
      {loading && (
        <div className="absolute inset-0 bg-white/50 rounded flex items-center justify-center">
          <svg className="animate-spin h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
      )}
    </div>
  );
}
