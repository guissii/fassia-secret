'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function MaquillageScroll() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const step = searchParams.get('step');
    if (!step) return;

    const id = `mp-step-${step}`;
    const el = document.getElementById(id);
    if (el) {
      const t = setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  return null;
}
