import type { Metadata } from 'next';
import Head from 'next/head';
import './globals.css';

export const metadata: Metadata = {
  title: 'Emojot | Bulk QR Generator',
  description: "Emojot's Bulk QR Generator is an internal tool designed for efficiently generating multiple QR codes in bulk for various use cases.",
  generator: 'v0.dev',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>
      <body>{children}</body>
    </html>
  );
}
