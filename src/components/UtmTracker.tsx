'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

export default function UtmTracker() {
  const searchParams = useSearchParams();
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    
    const utm_source = searchParams?.get('utm_source');
    const utm_medium = searchParams?.get('utm_medium');
    const utm_campaign = searchParams?.get('utm_campaign');

    if (utm_source) {
      tracked.current = true;
      
      // Store in localStorage for checkout attribution
      localStorage.setItem('utm_source', utm_source);
      if (utm_medium) localStorage.setItem('utm_medium', utm_medium);
      if (utm_campaign) localStorage.setItem('utm_campaign', utm_campaign);

      // Fire tracking API
      fetch('/api/track-utm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utm_source, utm_medium, utm_campaign })
      }).catch(err => console.error('UTM track error', err));
    }
  }, [searchParams]);

  return null;
}
