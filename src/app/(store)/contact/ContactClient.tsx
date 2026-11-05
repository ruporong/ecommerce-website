'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ContactClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success('Message sent successfully! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(data.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-xs font-bold tracking-wider uppercase text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input 
            required 
            type="text" 
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full bg-gray-50/80 border border-gray-300 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all shadow-xs"
            placeholder="e.g. Ayesha Rahman"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-xs font-bold tracking-wider uppercase text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input 
            required 
            type="email" 
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full bg-gray-50/80 border border-gray-300 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all shadow-xs"
            placeholder="e.g. ayesha@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-xs font-bold tracking-wider uppercase text-gray-700 mb-2">
          Subject <span className="text-red-500">*</span>
        </label>
        <input 
          required 
          type="text" 
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({...formData, subject: e.target.value})}
          className="w-full bg-gray-50/80 border border-gray-300 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all shadow-xs"
          placeholder="e.g. Inquiry regarding order #1024"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-xs font-bold tracking-wider uppercase text-gray-700 mb-2">
          Your Message <span className="text-red-500">*</span>
        </label>
        <textarea 
          required 
          id="message"
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          className="w-full bg-gray-50/80 border border-gray-300 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all shadow-xs resize-none"
          placeholder="Write your message or inquiry here..."
        />
      </div>

      <div className="pt-2">
        <button 
          disabled={isSubmitting}
          type="submit"
          className="w-full sm:w-auto min-w-[220px] px-8 py-4 bg-black text-white text-xs tracking-[0.2em] uppercase font-bold rounded-xl hover:bg-neutral-800 transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <span>Send Message</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
