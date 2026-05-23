import type { Metadata } from 'next';
import './globals.css';
import { ClientLayout } from '../src/components/ClientLayout';
import type { CSSProperties } from 'react';

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  title: 'Fassia Secret',
  description: 'Parapharmacie en ligne',
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
