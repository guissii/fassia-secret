import { Suspense } from 'react';
import BoutiqueClientPage from '@/BoutiqueClientPage';

export default function BoutiquePage() {
  return (
    <Suspense>
      <BoutiqueClientPage />
    </Suspense>
  );
}
