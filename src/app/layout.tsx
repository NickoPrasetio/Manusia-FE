import type { Metadata, Viewport } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'Manusia – Temukan Freelancer Terbaik',
  description: 'Platform freelance personal. Temukan dan booking jasa dari orang-orang terbaik di sekitar Anda.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)',  color: '#1d4ed8' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <QueryProvider>
          <div className="app-wrapper">{children}</div>
        </QueryProvider>
      </body>
    </html>
  );
}
