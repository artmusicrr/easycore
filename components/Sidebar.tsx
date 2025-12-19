'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/utils'
import { 
  Users, 
  ClipboardList, 
  CreditCard, 
  LayoutDashboard, 
  Settings, 
  LogOut,
  ShieldCheck,
  Stethoscope
} from 'lucide-react'

const MENU_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['admin', 'dentista', 'recepcao'] },
  { label: 'Pacientes', icon: Users, href: '/patients', roles: ['admin', 'recepcao', 'dentista'] },
  { label: 'Tratamentos', icon: Stethoscope, href: '/treatments', roles: ['admin', 'dentista', 'recepcao'] },
  { label: 'Pagamentos', icon: CreditCard, href: '/payments', roles: ['admin', 'recepcao'] },
  { label: 'Auditoria', icon: ClipboardList, href: '/admin', roles: ['admin'] },
  { label: 'Usuários', icon: ShieldCheck, href: '/admin/users', roles: ['admin'] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const filteredMenu = MENU_ITEMS.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  )

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-secondary-200 bg-white transition-transform">
      <div className="flex h-full flex-col px-3 py-4">
        {/* Logo */}
        <div className="mb-10 px-4 py-2">
          <h1 className="text-2xl font-bold tracking-tight text-primary-600">
            Easy<span className="text-secondary-900">Core</span>
          </h1>
          <p className="text-xs font-medium text-secondary-500 uppercase tracking-widest mt-1">Dental Management</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {filteredMenu.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                )}
              >
                <item.icon className={cn('mr-3 h-5 w-5', isActive ? 'text-primary-600' : 'text-secondary-400 group-hover:text-secondary-600')} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="mt-auto border-t border-secondary-100 pt-4">
          <div className="flex items-center px-4 py-2">
            <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold uppercase">
              {user?.nome?.substring(0, 2)}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="truncate text-sm font-semibold text-secondary-900">{user?.nome}</p>
              <p className="truncate text-xs text-secondary-500">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-2 flex w-full items-center rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sair do sistema
          </button>
        </div>
      </div>
    </aside>
  )
}
