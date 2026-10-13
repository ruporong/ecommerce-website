"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { getInvoiceHtml } from "@/app/actions/invoiceActions";

export default function PrintInvoiceButton({ orderId, variant = 'icon' }: { orderId: string, variant?: 'icon' | 'button' }) {
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePrint = async () => {
    setLoading(true);
    
    try {
      const res = await getInvoiceHtml(orderId);
      if (!res.success || !res.html) {
        toast.error(res.error || "Failed to generate invoice");
        setLoading(false);
        return;
      }

      const iframe = iframeRef.current;
      if (iframe) {
        const doc = iframe.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(res.html);
          doc.close();

          // Wait for images and fonts to load before printing
          setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setLoading(false);
          }, 500);
        }
      }
    } catch (error) {
      toast.error("An error occurred");
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={handlePrint}
        disabled={loading}
        className={variant === 'icon' 
          ? "p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50" 
          : "px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-50"
        }
        title="Print Invoice"
      >
        {loading ? (
          <svg className="animate-spin w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
        )}
        {variant === 'button' && (loading ? 'Preparing...' : 'Print Invoice')}
      </button>
      <iframe ref={iframeRef} style={{ display: 'none', width: 0, height: 0, border: 'none' }} title="Invoice Print Frame" />
    </>
  );
}
