import { useState, useEffect, useCallback } from 'react'
import { getDb, attachTagsToBullets, setBulletTags } from '../lib/db'
import type { BulletWithTags, NewBulletPayload, UpdateBulletPayload, Bullet } from '../types'

export function useBullets(jobId: number | null) {
  const [bullets, setBullets] = useState<BulletWithTags[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!jobId) { setBullets([]); return }
    setLoading(true)
    try {
      const db = await getDb()
      const rows = await db.select<Bullet[]>(
        'SELECT * FROM bullets WHERE job_id = ? ORDER BY sort_order ASC, id DESC', [jobId]
      )
      setBullets(await attachTagsToBullets(db, rows))
    } finally {
      setLoading(false)
    }
  }, [jobId])

  useEffect(() => { load() }, [load])

  const createBullet = useCallback(async (data: NewBulletPayload) => {
    const db = await getDb()
    const [{ m }] = await db.select<[{ m: number | null }]>(
      'SELECT MAX(sort_order) as m FROM bullets WHERE job_id = ?', [data.job_id]
    )
    const order = (m ?? -1) + 1
    const result = await db.execute(
      'INSERT INTO bullets (job_id, mode, custom_text, imm_impact, imm_method, imm_metric, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [data.job_id, data.mode, data.custom_text ?? null, data.imm_impact ?? null,
       data.imm_method ?? null, data.imm_metric ?? null, order]
    )
    if (data.tag_ids?.length) await setBulletTags(db, result.lastInsertId as number, data.tag_ids)
    const [row] = await db.select<Bullet[]>('SELECT * FROM bullets WHERE id = ?', [result.lastInsertId])
    const bullet = { ...row, tags: data.tag_ids?.length
      ? await db.select('SELECT t.* FROM tags t JOIN bullet_tags bt ON bt.tag_id = t.id WHERE bt.bullet_id = ?', [row.id])
      : [] } as BulletWithTags
    setBullets((prev) => [...prev, bullet])
    return bullet
  }, [])

  const updateBullet = useCallback(async (data: UpdateBulletPayload) => {
    const db = await getDb()
    const { id, tag_ids, ...fields } = data
    if (Object.keys(fields).length > 0) {
      const sets = Object.keys(fields).map((k) => `${k} = ?`).join(', ')
      await db.execute(
        `UPDATE bullets SET ${sets}, updated_at = datetime('now') WHERE id = ?`,
        [...Object.values(fields), id]
      )
    }
    if (tag_ids !== undefined) await setBulletTags(db, id, tag_ids)
    const [row] = await db.select<Bullet[]>('SELECT * FROM bullets WHERE id = ?', [id])
    const updated = { ...row, tags: await db.select(
      'SELECT t.* FROM tags t JOIN bullet_tags bt ON bt.tag_id = t.id WHERE bt.bullet_id = ?', [id]
    ) } as BulletWithTags
    setBullets((prev) => prev.map((b) => (b.id === id ? updated : b)))
    return updated
  }, [])

  const deleteBullet = useCallback(async (id: number) => {
    const db = await getDb()
    await db.execute('DELETE FROM bullets WHERE id = ?', [id])
    setBullets((prev) => prev.filter((b) => b.id !== id))
  }, [])

  return { bullets, loading, createBullet, updateBullet, deleteBullet, reload: load }
}

export function useAllBullets() {
  const [bullets, setBullets] = useState<BulletWithTags[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const db = await getDb()
      const rows = await db.select<Bullet[]>(
        'SELECT * FROM bullets ORDER BY job_id ASC, sort_order ASC, id DESC'
      )
      setBullets(await attachTagsToBullets(db, rows))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  return { bullets, loading, reload: load }
}
