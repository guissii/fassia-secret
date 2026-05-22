import { Suspense } from 'react';
import PromotionsClientPage from '../../src/PromotionsClientPage';

export default function PromotionsPage() {
  return (
    <Suspense>
      <PromotionsClientPage />
    </Suspense>
  );
}

