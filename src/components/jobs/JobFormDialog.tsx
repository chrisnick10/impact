import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Job } from '../../types'

function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

interface Props {
  open: boolean
  job?: Job | null
  onClose: () => void
  onSave: (data: { company: string; title: string; start_date: string; end_date: string | null }) => Promise<void>
}

export function JobFormDialog({ open, job, onClose, onSave }: Props) {
  const [company, setCompany] = useState('')
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState(currentMonth)
  const [endDate, setEndDate] = useState('')
  const [current, setCurrent] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (job) {
      setCompany(job.company); setTitle(job.title); setStartDate(job.start_date)
      setEndDate(job.end_date ?? ''); setCurrent(!job.end_date)
    } else {
      setCompany(''); setTitle(''); setStartDate(currentMonth()); setEndDate(''); setCurrent(true)
    }
    setError(null)
  }, [job, open])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!company.trim() || !title.trim() || !startDate) return
    setSaving(true)
    setError(null)
    try {
      await onSave({ company: company.trim(), title: title.trim(), start_date: startDate, end_date: current ? null : (endDate || null) })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Check the console for details.')
    } finally { setSaving(false) }
  }

  const inp = "w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">{job ? 'Edit Position' : 'Add Position'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">Company</label>
            <input className={inp} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Corp" required autoFocus />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">Title</label>
            <input className={inp} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior Product Manager" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">Start</label>
              <input type="month" className={inp} value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">End</label>
              <input type="month" className={`${inp} disabled:opacity-40`} value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={current} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="rounded" checked={current} onChange={(e) => setCurrent(e.target.checked)} />
            <span className="text-muted-foreground">Current position</span>
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-md border border-border hover:bg-accent">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
              {saving ? 'Saving…' : job ? 'Save changes' : 'Add position'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
