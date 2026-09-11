import type { Metadata } from 'next';
import './globals.css';
import { PageTransition } from '@/components/layout/PageTransition';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { PWARoleRedirect } from '@/components/pwa/PWARoleRedirect';
import { PWASplashScreen } from '@/components/pwa/PWASplashScreen';
import { PWAPullToRefresh } from '@/components/pwa/PWAPullToRefresh';

export const metadata: Metadata = {
  title: 'Replate — Where Surplus Finds Purpose',
  description: 'Replate: Where Surplus Finds Purpose. Platform redistribusi makanan berlebih yang menghubungkan Food Provider dengan penerima manfaat secara efisien, aman, dan transparan. Bersama kurangi food waste untuk masa depan berkelanjutan.',
  keywords: ['food waste', 'food rescue', 'redistribusi makanan', 'Where Surplus Finds Purpose', 'SDG', 'sustainability', 'Replate', 'Surabaya'],
  authors: [{ name: 'Replate Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', sizes: '48x48', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Replate',
    startupImage: [
      '/splash/splash.png',
    ],
  },
  openGraph: {
    title: 'Replate — Selamatkan Makanan, Bantu Sesama',
    description: 'Platform redistribusi makanan berlebih untuk masa depan berkelanjutan.',
    type: 'website',
    locale: 'id_ID',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Replate Official Logo',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-sans antialiased bg-[#F8F9FA] text-slate-900">
        <AuthProvider>
          <PWAPullToRefresh />
          <PWASplashScreen />
          <PWARoleRedirect />
          <PageTransition>{children}</PageTransition>
        </AuthProvider>
      </body>
    </html>
  );
}
