'use client';

import { useState } from 'react';
import OrderModal from './OrderModal';

export default function OrderModalTrigger({ order, children }: { order: any, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="hover:text-blue-600 hover:underline focus:outline-none"
      >
        {children}
      </button>
      <OrderModal order={order} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
