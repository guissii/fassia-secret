import { Suspense } from 'react';
import PromotionsClientPage from '@/PromotionsClientPage';

export default function PromotionsPage() {
  return (
    <Suspense>
      <PromotionsClientPage />
    </Suspense>
  );
}

