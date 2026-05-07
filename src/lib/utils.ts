import type { BulletWithTags } from '../types'

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function composeIMM(
  impact: string | null,
  method: string | null,
  metric: string | null
): string {
  if (!impact) return ''
  const parts: string[] = [impact]
  if (method) parts.push(`by ${method}`)
  if (metric) parts.push(metric)
  return parts.join(', ')
}

export function getBulletText(bullet: BulletWithTags): string {
  if (bullet.mode === 'custom') return bullet.custom_text ?? ''
  return composeIMM(bullet.imm_impact, bullet.imm_method, bullet.imm_metric)
}

export function formatDateRange(startDate: string, endDate: string | null): string {
  const fmt = (d: string): string => {
    const [year, month] = d.split('-')
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })
  }
  return `${fmt(startDate)} — ${endDate ? fmt(endDate) : 'Present'}`
}
