import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Emojot | Bulk QR Generator',
  description: 'Emojot\'s Bulk QR Generator is an internal tool designed for efficiently generating multiple QR codes in bulk for various use cases.',
  generator: 'v0.dev',
  icons: {
    icon: '/Favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
