'use client';

import { useState, useEffect } from 'react';

interface FlashSaleData {
  title: string;
  end_time: string;
  discount_percentage: number;
}

export default function FlashSaleBanner({ data }: { data: FlashSaleData | null }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!data) return;

    const calculateTimeLeft = () => {
      const difference = new Date(data.end_time).getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [data]);

  if (!data || new Date(data.end_time).getTime() < new Date().getTime()) return null;

  return (
    <div className="bg-charcoal text-white py-2 px-4 text-center w-full flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-xs md:text-sm font-medium">
      <div className="flex items-center gap-2">
        <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold animate-pulse">FLASH SALE</span>
        <span>{data.title} - Up to {data.discount_percentage}% OFF!</span>
      </div>
      <div className="flex items-center gap-1.5 font-mono bg-black/30 px-3 py-1 rounded-full">
        <span>Ends in:</span>
        <span className="w-6 text-center">{timeLeft.days}d</span>:
        <span className="w-5 text-center">{timeLeft.hours.toString().padStart(2, '0')}</span>:
        <span className="w-5 text-center">{timeLeft.minutes.toString().padStart(2, '0')}</span>:
        <span className="w-5 text-center">{timeLeft.seconds.toString().padStart(2, '0')}</span>
      </div>
    </div>
  );
}
