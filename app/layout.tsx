'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import Sidebar from '~/components/Sidebar'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'optional'
})

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
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
