import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Maquillage & Parfums',
  description: 'Maquillage de grandes marques et parfums prestigieux. Fond de teint, mascara, rouges à lèvres et parfums homme/femme.',
  openGraph: {
    title: 'Maquillage & Parfums — Fassia Secret',
    description: 'Le meilleur du maquillage et des parfums au Maroc.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
