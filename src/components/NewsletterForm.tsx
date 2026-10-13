'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success('Successfully subscribed to our newsletter!');
        setEmail('');
      } else {
        toast.error(data.error || 'Failed to subscribe.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubscribe} className="flex border-b border-warm-white/30 focus-within:border-warm-white transition-colors pb-2">
      <input 
        type="email" 
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email Address" 
        className="bg-transparent border-none outline-none w-full text-sm text-warm-white placeholder-warm-white/50" 
      />
      <button 
        type="submit" 
        disabled={loading}
        className="text-xs tracking-widest uppercase ml-4 hover:text-dusty-rose transition-colors disabled:opacity-50"
      >
        {loading ? '...' : 'Subscribe'}
      </button>
    </form>
  );
}
