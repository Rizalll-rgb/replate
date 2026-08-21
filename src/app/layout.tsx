import type { Metadata } from 'next';
import './globals.css';
import { PageTransition } from '@/components/layout/PageTransition';
import { AuthProvider } from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'FoodBridge — Selamatkan Makanan, Bantu Sesama',
  description: 'Platform redistribusi makanan berlebih yang menghubungkan Food Provider dengan penerima manfaat secara efisien, aman, dan transparan. Bersama kurangi food waste untuk masa depan berkelanjutan.',
  keywords: ['food waste', 'food rescue', 'redistribusi makanan', 'SDG', 'sustainability', 'FoodBridge', 'Surabaya'],
  authors: [{ name: 'FoodBridge Team' }],
  openGraph: {
    title: 'FoodBridge — Selamatkan Makanan, Bantu Sesama',
    description: 'Platform redistribusi makanan berlebih untuk masa depan berkelanjutan.',
    type: 'website',
    locale: 'id_ID',
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
          <PageTransition>{children}</PageTransition>
        </AuthProvider>
      </body>
    </html>
  );
}
