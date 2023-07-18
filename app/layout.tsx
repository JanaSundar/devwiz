import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import Navbar from '~/components/Navbar'
import Sidebar from '~/components/Sidebar'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'optional'
})

export const metadata: Metadata = {
  title: 'DevWiz',
  description: 'one place to find all the resources for developers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className={`bg-zinc-950 text-white font-sans h-screen flex flex-col scroll-smooth`}>
        <main className='flex-1'>
          <div className='flex flex-1 h-full divide-x-2 divide-gray-50/10'>
            <Sidebar />
            {children}
          </div>
        </main>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
