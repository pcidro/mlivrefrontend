export { formatDocument } from './formatDocument.ts'

export function formatPhone(value: string | null | undefined): string {
  if (!value) return 'Sem telefone'
  let digits = value.replace(/\D/g, '')
  if (/^55\d{10,11}$/.test(digits)) digits = digits.slice(2)
  if (/^\d{11}$/.test(digits)) return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  if (/^\d{10}$/.test(digits)) return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
  return value
}

export function whatsappUrl(normalizedPhone: string | null): string | null {
  return normalizedPhone && /^55[1-9]\d{9,10}$/.test(normalizedPhone) ? `https://wa.me/${normalizedPhone}` : null
}

export function formatDate(value: string | null | undefined, withTime = false): string {
  if (!value) return 'Não informada'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Não informada'
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short', ...(withTime ? { timeStyle: 'short' as const } : {}),
  }).format(date)
}

export function initials(name: string | null | undefined): string {
  return (name || 'Cliente').trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase()
}

export const formatNumber = (value: number) => value.toLocaleString('pt-BR')

export function localDateInput(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/** Dias do filtro representam o dia completo no fuso do navegador. */
export function dayBoundary(value: string | undefined, end = false): string | undefined {
  if (!value) return undefined
  const date = new Date(`${value}T${end ? '23:59:59.999' : '00:00:00.000'}`)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}
