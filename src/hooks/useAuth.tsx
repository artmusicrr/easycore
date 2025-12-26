'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { authService } from '@/services'
import { LoginInput } from '@/schemas'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  nome: string
  email: string
  role: 'recepcao' | 'dentista' | 'admin'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (data: LoginInput) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = Cookies.get('easycore.token')
    const savedUser = localStorage.getItem('easycore.user')

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        Cookies.remove('easycore.token')
        localStorage.removeItem('easycore.user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (data: LoginInput) => {
    try {
      const response = await authService.login(data)
      
      // A API retorna { message, token, user }
      const token = response.token
      const userData = response.user

      if (!token || !userData) {
        throw new Error('Resposta inválida do servidor')
      }

      Cookies.set('easycore.token', token, { expires: 1 }) // 1 day
      localStorage.setItem('easycore.user', JSON.stringify(userData))
      setUser(userData)

      // Redirecionamento baseado na role
      if (userData.role === 'admin') router.push('/dashboard')
      else if (userData.role === 'dentista') router.push('/dashboard')
      else router.push('/dashboard')
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    Cookies.remove('easycore.token')
    localStorage.removeItem('easycore.user')
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
