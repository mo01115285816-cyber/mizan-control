import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MIZAN Control | لوحة تحكم ميزان للإنترنت المنزلي',
  description: 'لوحة التحكم الإدارية لمالك نظام ميزان لإدارة استهلاك الإنترنت والحصص المنزلية والأجهزة المتصلة.',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/mizan_balanced_share_android_icon.png', type: 'image/png' },
    ],
    shortcut: '/icon.png',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-icon.png',
      },
    ],
  },
  openGraph: {
    title: 'MIZAN Control | إدارة الإنترنت المنزلي',
    description: 'لوحة التحكم الإدارية لمالك نظام ميزان لإدارة استهلاك الإنترنت والحصص المنزلية والأجهزة المتصلة.',
    images: [
      {
        url: '/mizan_balanced_share_android_icon.png',
        width: 512,
        height: 512,
        alt: 'MIZAN Control Icon',
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
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="shortcut icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <meta name="theme-color" content="#151515" />
      </head>
      <body className="bg-[#F6F7F2] text-[#151515] antialiased selection:bg-[#C8F24A] selection:text-[#151515] font-['IBM_Plex_Sans_Arabic',sans-serif] min-h-screen">
        {children}
      </body>
    </html>
  );
}

