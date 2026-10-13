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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative group">
          <input 
            required 
            type="text" 
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="block w-full px-0 py-3 bg-transparent border-0 border-b-2 border-gray-200 text-gray-900 focus:ring-0 focus:border-charcoal peer transition-colors"
            placeholder=" "
          />
          <label htmlFor="name" className="absolute text-xs tracking-widest uppercase text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-charcoal peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
            Name
          </label>
        </div>
        
        <div className="relative group">
          <input 
            required 
            type="email" 
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="block w-full px-0 py-3 bg-transparent border-0 border-b-2 border-gray-200 text-gray-900 focus:ring-0 focus:border-charcoal peer transition-colors"
            placeholder=" "
          />
          <label htmlFor="email" className="absolute text-xs tracking-widest uppercase text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-charcoal peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
            Email
          </label>
        </div>
      </div>

      <div className="relative group">
        <input 
          required 
          type="text" 
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({...formData, subject: e.target.value})}
          className="block w-full px-0 py-3 bg-transparent border-0 border-b-2 border-gray-200 text-gray-900 focus:ring-0 focus:border-charcoal peer transition-colors"
          placeholder=" "
        />
        <label htmlFor="subject" className="absolute text-xs tracking-widest uppercase text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-charcoal peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
          Subject
        </label>
      </div>

      <div className="relative group mt-10">
        <textarea 
          required 
          id="message"
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          className="block w-full px-0 py-3 bg-transparent border-0 border-b-2 border-gray-200 text-gray-900 focus:ring-0 focus:border-charcoal peer transition-colors resize-none"
          placeholder=" "
        />
        <label htmlFor="message" className="absolute text-xs tracking-widest uppercase text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-charcoal peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
          Message
        </label>
      </div>

      <button 
        disabled={isSubmitting}
        type="submit"
        className="mt-8 px-10 py-4 bg-charcoal text-white text-xs tracking-[0.2em] uppercase font-medium hover:bg-black transition-colors disabled:opacity-50 inline-flex items-center gap-3"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
        {!isSubmitting && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        )}
      </button>
    </form>
  );
}
