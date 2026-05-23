import { Suspense } from 'react';
import ComplementsClientPage from '@/ComplementsClientPage';

export default function ComplementsAlimentairesPage() {
  return (
    <Suspense>
      <ComplementsClientPage />
    </Suspense>
  );
}
