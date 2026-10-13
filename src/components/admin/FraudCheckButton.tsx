"use client";

import { useState } from "react";
import { checkFraud } from "@/app/actions/steadfastActions";

export default function FraudCheckButton({ orderId, phone, initialScore }: { orderId: string, phone: string, initialScore: number }) {
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(initialScore);

  const handleCheck = async () => {
    setLoading(true);
    const res = await checkFraud(orderId, phone);
    if (res.success && res.score !== undefined) {
      setScore(res.score);
    }
    setLoading(false);
  };

  let badgeColor = "bg-gray-100 text-gray-800";
  if (score > 0) {
    if (score < 30) badgeColor = "bg-green-100 text-green-800";
    else if (score < 70) badgeColor = "bg-yellow-100 text-yellow-800";
    else badgeColor = "bg-red-100 text-red-800";
  }

  return (
    <div className="flex items-center gap-2 mt-1">
      {score === 0 ? (
        <button 
          onClick={handleCheck} 
          disabled={loading}
          className="text-[10px] uppercase tracking-wider bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-0.5 rounded transition-colors"
        >
          {loading ? 'Checking...' : 'Check Fraud'}
        </button>
      ) : (
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${badgeColor}`}>
          Fraud Score: {score}/100
        </span>
      )}
    </div>
  );
}
