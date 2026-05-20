import { Suspense } from 'react';
import BoutiqueClientPage from '../../src/BoutiqueClientPage';

export default function BoutiquePage() {
  return (
    <Suspense>
      <BoutiqueClientPage />
    </Suspense>
  );
}
