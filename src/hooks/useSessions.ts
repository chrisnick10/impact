import { useState, useEffect, useCallback } from 'react'
import { getDb } from '../lib/db'
import type { JDSession, JDSessionWithBullets } from '../types'

export function useSessions() {
  const [sessions, setSessions] = useState<JDSession[]>([])

  const load = useCallback(async () => {
    const db = await getDb()
    setSessions(await db.select<JDSession[]>('SELECT * FROM jd_sessions ORDER BY updated_at DESC'))
  }, [])

  useEffect(() => { load() }, [load])

  const createSession = useCallback(async (data: { title: string; jd_text: string }) => {
    const db = await getDb()
    const result = await db.execute('INSERT INTO jd_sessions (title, jd_text) VALUES (?, ?)', [data.title, data.jd_text])
    const [session] = await db.select<JDSession[]>('SELECT * FROM jd_sessions WHERE id = ?', [result.lastInsertId])
    setSessions((prev) => [session, ...prev])
    return session
  }, [])

  const updateSession = useCallback(async (data: Partial<JDSession> & { id: number }) => {
    const db = await getDb()
    const { id, ...fields } = data
    const sets = Object.keys(fields).map((k) => `${k} = ?`).join(', ')
    await db.execute(`UPDATE jd_sessions SET ${sets}, updated_at = datetime('now') WHERE id = ?`, [...Object.values(fields), id])
    const [session] = await db.select<JDSession[]>('SELECT * FROM jd_sessions WHERE id = ?', [id])
    setSessions((prev) => prev.map((s) => (s.id === id ? session : s)))
    return session
  }, [])

  const getSession = useCallback(async (id: number): Promise<JDSessionWithBullets> => {
    const db = await getDb()
    const [session] = await db.select<JDSession[]>('SELECT * FROM jd_sessions WHERE id = ?', [id])
    const rows = await db.select<{ bullet_id: number }[]>('SELECT bullet_id FROM jd_session_bullets WHERE session_id = ?', [id])
    return { ...session, bullet_ids: rows.map((r) => r.bullet_id) }
  }, [])

  const setBullets = useCallback(async (sessionId: number, bulletIds: number[]) => {
    const db = await getDb()
    await db.execute('DELETE FROM jd_session_bullets WHERE session_id = ?', [sessionId])
    for (const bid of bulletIds) {
      await db.execute('INSERT OR IGNORE INTO jd_session_bullets (session_id, bullet_id) VALUES (?, ?)', [sessionId, bid])
    }
  }, [])

  return { sessions, createSession, updateSession, getSession, setBullets, reload: load }
}
