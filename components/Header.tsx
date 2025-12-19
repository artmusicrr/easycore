'use client'

import React from 'react'
import { cn } from '@/utils/utils'
import { Bell, Search, UserCircle } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-secondary-200 bg-white/80 px-8 backdrop-blur-md">
      <div className="flex flex-1 items-center">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
          <input
            type="text"
            placeholder="Buscar pacientes, tratamentos..."
            className="h-10 w-full rounded-full border border-secondary-200 bg-secondary-50/50 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative rounded-full p-2 text-secondary-500 transition-colors hover:bg-secondary-100 hover:text-secondary-700">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        
        <div className="h-8 w-px bg-secondary-200 mx-2"></div>
        
        <button className="flex items-center space-x-2 rounded-full border border-secondary-200 p-1 pr-4 transition-colors hover:bg-secondary-50">
          <div className="h-7 w-7 rounded-full bg-secondary-200 flex items-center justify-center overflow-hidden">
             <UserCircle className="h-6 w-6 text-secondary-500" />
          </div>
          <span className="text-sm font-medium text-secondary-700">Opções</span>
        </button>
      </div>
    </header>
  )
}
