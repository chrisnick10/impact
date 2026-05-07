import { useState, useEffect, useRef, useCallback } from 'react'
import { useAllBullets } from '../hooks/useBullets'
import { useJobs } from '../hooks/useJobs'
import { useSessions } from '../hooks/useSessions'
import { TagBadge } from '../components/tags/TagBadge'
import { getBulletText } from '../lib/utils'
import type { BulletWithTags, JDSession } from '../types'

export function MatchView() {
  const { bullets, loading } = useAllBullets()
  const { jobs } = useJobs()
  const { sessions, createSession, updateSession, setBullets: saveSessionBullets, getSession } = useSessions()
  const [jdText, setJdText] = useState('')
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set())
  const [currentSession, setCurrentSession] = useState<JDSession | null>(null)
  const [copied, setCopied] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const autosave = useCallback(async (text: string, ids: Set<number>, session: JDSession | null) => {
    if (!session) {
      if (!text.trim() && ids.size === 0) return
      const s = await createSession({ title: 'Untitled', jd_text: text })
      setCurrentSession(s)
      await saveSessionBullets(s.id, [...ids])
    } else {
      await updateSession({ id: session.id, jd_text: text })
      await saveSessionBullets(session.id, [...ids])
    }
  }, [createSession, updateSession, saveSessionBullets])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => autosave(jdText, checkedIds, currentSession), 1200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [jdText, checkedIds, currentSession, autosave])

  async function loadSession(session: JDSession) {
    const full = await getSession(session.id)
    setCurrentSession(session); setJdText(full.jd_text); setCheckedIds(new Set(full.bullet_ids))
  }

  async function handleCopy() {
    const text = bullets.filter((b) => checkedIds.has(b.id)).map((b) => `• ${getBulletText(b)}`).join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const bulletsByJob = jobs.map((job) => ({ job, bullets: bullets.filter((b) => b.job_id === job.id) })).filter((g) => g.bullets.length > 0)

  return (
    <div className="h-full flex overflow-hidden">
      <div className="w-2/5 flex flex-col border-r border-border">
        <div className="px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-sm font-semibold">Job Description</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Paste the JD to help identify matching bullets</p>
        </div>
        <div className="p-4 border-b border-border shrink-0">
          <select className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            value={currentSession?.id ?? ''} onChange={(e) => { const s = sessions.find((s) => s.id === parseInt(e.target.value)); if (s) loadSession(s) }}>
            <option value="">— New session —</option>
            {sessions.map((s) => <option key={s.id} value={s.id}>{s.title} ({new Date(s.created_at).toLocaleDateString()})</option>)}
          </select>
        </div>
        <textarea className="flex-1 resize-none bg-background px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste the job description here…&#10;&#10;Your bullet selections will auto-save." />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-border shrink-0 flex items-center justify-between">
          <div><h2 className="text-sm font-semibold">Your Bullets</h2><p className="text-xs text-muted-foreground mt-0.5">Check the bullets that match this role</p></div>
          <span className="text-xs text-muted-foreground">{checkedIds.size} selected</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && !bulletsByJob.length && <p className="text-sm text-muted-foreground text-center py-8">No bullets yet. Add some from the Jobs view first.</p>}
          {bulletsByJob.map(({ job, bullets: jb }) => (
            <div key={job.id}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{job.title} · {job.company}</h3>
              <div className="space-y-2">
                {jb.map((bullet) => <BulletCheckItem key={bullet.id} bullet={bullet} checked={checkedIds.has(bullet.id)} onToggle={() => setCheckedIds((prev) => { const n = new Set(prev); n.has(bullet.id) ? n.delete(bullet.id) : n.add(bullet.id); return n })} />)}
              </div>
            </div>
          ))}
        </div>
        {checkedIds.size > 0 && (
          <div className="px-5 py-3 border-t border-border bg-card shrink-0 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{checkedIds.size} bullet{checkedIds.size !== 1 ? 's' : ''} selected</span>
            <div className="flex gap-2">
              <button className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setCheckedIds(new Set())}>Clear</button>
              <button className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90" onClick={handleCopy}>{copied ? '✓ Copied!' : 'Copy bullets'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function BulletCheckItem({ bullet, checked, onToggle }: { bullet: BulletWithTags; checked: boolean; onToggle: () => void }) {
  return (
    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${checked ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80 hover:bg-accent/40'}`}>
      <input type="checkbox" className="mt-0.5 shrink-0 accent-primary" checked={checked} onChange={onToggle} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-relaxed">{getBulletText(bullet)}</p>
        {bullet.tags.length > 0 && <div className="flex flex-wrap gap-1 mt-1.5">{bullet.tags.map((tag) => <TagBadge key={tag.id} tag={tag} />)}</div>}
      </div>
    </label>
  )
}
