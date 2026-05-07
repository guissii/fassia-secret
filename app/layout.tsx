import type { Metadata } from 'next';
import './globals.css';
import type { CSSProperties } from 'react';

export const metadata: Metadata = {
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
      <body style={style}>{children}</body>
    </html>
  );
}
