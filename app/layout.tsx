import { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import BaseLayout from '~/layouts/BaseLayout'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'optional'
})

export const metaData: Metadata = {
  title: 'Devwiz',
  description: 'One place to find all the tools for developers',
  twitter: {
    card: 'summary_large_image',
    creator: '@jana__sundar',
    description: 'One place to find all the tools for developers',
    title: 'Devwiz',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
      }
    ]
  },
  openGraph: {
    title: 'Devwiz',
    description: 'One place to find all the tools for developers',
    url: '/logo.png',
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
        <BaseLayout>
          {children}
        </BaseLayout>
      </body>
    </html>
  )
}
