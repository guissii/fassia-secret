'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function KoreanBeautyScroll() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const step = searchParams.get('step');
    if (!step) return;

    const id = `kb-step-${step}`;
    const el = document.getElementById(id);
    if (el) {
      // Wait for layout to settle then scroll
      const t = setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  return null;
}
