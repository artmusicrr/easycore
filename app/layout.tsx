import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import AdminLayout from '@/components/AdminLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EasyCore - Dental Management',
  description: 'Sistema completo de gestão odontológica',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          <AdminLayout>
            {children}
          </AdminLayout>
        </Providers>
      </body>
    </html>
  )
}
