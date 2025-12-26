'use client'

import React from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { useAuth } from '@/hooks/useAuth'
import { usePathname } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  
  const isLoginPage = pathname === '/login'

  if (isLoginPage) return <>{children}</>

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-secondary-50">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
          <p className="mt-4 text-sm font-medium text-secondary-600">Carregando EasyCore...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="min-h-[calc(100-4rem)] p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
