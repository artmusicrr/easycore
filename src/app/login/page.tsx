'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginInput } from '@/schemas'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { ShieldCheck, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [requires2FA, setRequires2FA] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setError(null)
    setIsLoading(true)

    try {
      await login(data)
    } catch (err: any) {
      if (err.response?.data?.requires_2fa) {
        setRequires2FA(true)
      } else {
        setError(err.response?.data?.error || 'Erro ao realizar login. Tente novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary-600">
            Easy<span className="text-secondary-900">Core</span>
          </h1>
          <p className="mt-2 text-sm text-secondary-500">Gestão Odontológica Profissional</p>
        </div>

        <Card title={requires2FA ? "Autenticação 2FA" : "Entrar no Sistema"} description={requires2FA ? "Digite o código enviado ao seu dispositivo" : "Informe suas credenciais para acessar o painel"}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!requires2FA ? (
              <>
                <div className="relative">
                  <Mail className="absolute left-3 top-9 h-4 w-4 text-secondary-400" />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="exemplo@easycore.com"
                    className="pl-10"
                    {...register('email')}
                    error={errors.email?.message}
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-9 h-4 w-4 text-secondary-400" />
                  <Input
                    label="Senha"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...register('senha')}
                    error={errors.senha?.message}
                  />
                </div>
              </>
            ) : (
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-9 h-4 w-4 text-secondary-400" />
                <Input
                  label="Código 2FA"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className="pl-10 text-center text-lg tracking-[0.5em] font-mono"
                  {...register('two_factor_code')}
                  error={errors.two_factor_code?.message}
                />
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              {requires2FA ? "Verificar" : "Entrar"}
            </Button>

            {!requires2FA && (
              <div className="mt-4 text-center">
                <a href="#" className="text-xs font-medium text-primary-600 hover:text-primary-700">
                  Esqueceu sua senha?
                </a>
              </div>
            )}
            
            {requires2FA && (
               <button 
                type="button"
                onClick={() => setRequires2FA(false)}
                className="w-full text-center text-xs font-medium text-secondary-500 hover:text-secondary-700 mt-2"
               >
                 Voltar para o login
               </button>
            )}
          </form>
        </Card>

        <p className="mt-8 text-center text-xs text-secondary-400">
          &copy; 2025 EasyCore. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
