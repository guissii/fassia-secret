import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'K-Beauty — Cosmétiques Coréens',
  description: 'La vraie routine skincare coréenne. Sérums, essences, toners et masques des meilleures marques de K-Beauty (Cosrx, Beauty of Joseon...).',
  openGraph: {
    title: 'Cosmétiques Coréens & K-Beauty — Fassia Secret',
    description: 'La routine skincare coréenne au Maroc.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
