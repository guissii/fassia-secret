import type { Metadata } from 'next';
import './globals.css';
import { ClientLayout } from '../src/components/ClientLayout';
import type { CSSProperties } from 'react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Fassia Secret — Parapharmacie en Ligne au Maroc',
    template: '%s | Fassia Secret',
  },
  description: 'Votre parapharmacie en ligne au Maroc. Soins visage, K-Beauty, compléments alimentaires, maquillage et parfums. Livraison gratuite dès 400 MAD.',
  keywords: ['parapharmacie', 'maroc', 'skincare', 'k-beauty', 'soins visage', 'maquillage', 'compléments alimentaires', 'fassia secret', 'beauté en ligne'],
  authors: [{ name: 'Fassia Secret' }],
  creator: 'Fassia Secret',
  openGraph: {
    type: 'website',
    locale: 'fr_MA',
    url: siteUrl,
    siteName: 'Fassia Secret',
    title: 'Fassia Secret — Parapharmacie en Ligne au Maroc',
    description: 'Soins visage, K-Beauty, compléments alimentaires, maquillage et parfums. Livraison partout au Maroc.',
    images: [{ url: '/logo.png', width: 800, height: 600, alt: 'Fassia Secret Logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fassia Secret — Parapharmacie en Ligne au Maroc',
    description: 'Soins visage, K-Beauty, compléments alimentaires, maquillage et parfums.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: { icon: '/favicon.svg' },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  type CssVars = {
    '--site-bg-image': string;
  };

  const style: CSSProperties & CssVars = {
    '--site-bg-image': `url("${basePath}/arrier%20plan.png")`,
  };

  return (
    <html lang="fr">
      <body style={style}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
