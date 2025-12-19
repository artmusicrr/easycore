import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

export function maskCPF(cpf: string) {
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return '***.***.***-**'
  return `***.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-**`
}
