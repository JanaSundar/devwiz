import { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import Sidebar from '~/components/Sidebar'
import { Toaster } from 'react-hot-toast'
import Analytics from '~/components/Analytics'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'optional'
})

export const metadata: Metadata = {
  title: 'Devwiz',
  description: 'One place to find all the tools for developers',
  metadataBase: new URL('https://devwiz.xyz'),
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@jana__sundar',
    description: 'One place to find all the tools for developers',
    title: 'Devwiz',
    images: [
      {
        url: 'https://www.devwiz.xyz/logo.png',
        width: 1200,
        height: 630,
      }
    ]
  },
  openGraph: {
    title: 'Devwiz',
    description: 'One place to find all the tools for developers',
    url: 'https://www.devwiz.xyz/logo.png',
    siteName: 'Devwiz',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className={`bg-zinc-950 text-white font-sans h-screen flex flex-col scroll-smooth`}>
        <main className='flex-1 flex h-full divide-x-2 divide-gray-50/10'>
          <Sidebar />
          {children}
        </main>
        <Toaster position="top-right" toastOptions={{
          duration: 2000,
        }} />
        <Analytics />
      </body>
    </html>
  )
}
