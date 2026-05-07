import { useState, useEffect, useCallback } from 'react'
import { getDb } from '../lib/db'
import type { Job } from '../types'

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const db = await getDb()
      setJobs(await db.select<Job[]>('SELECT * FROM jobs ORDER BY sort_order ASC, id DESC'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const createJob = useCallback(async (data: Omit<Job, 'id' | 'created_at' | 'updated_at' | 'sort_order'>) => {
    const db = await getDb()
    const [{ m }] = await db.select<[{ m: number | null }]>('SELECT MAX(sort_order) as m FROM jobs')
    const order = (m ?? -1) + 1
    const result = await db.execute(
      'INSERT INTO jobs (company, title, start_date, end_date, sort_order) VALUES (?, ?, ?, ?, ?)',
      [data.company, data.title, data.start_date, data.end_date ?? null, order]
    )
    const [job] = await db.select<Job[]>('SELECT * FROM jobs WHERE id = ?', [result.lastInsertId])
    setJobs((prev) => [...prev, job])
    return job
  }, [])

  const updateJob = useCallback(async (data: Partial<Job> & { id: number }) => {
    const db = await getDb()
    const { id, ...fields } = data
    const sets = Object.keys(fields).map((k) => `${k} = ?`).join(', ')
    await db.execute(
      `UPDATE jobs SET ${sets}, updated_at = datetime('now') WHERE id = ?`,
      [...Object.values(fields), id]
    )
    const [job] = await db.select<Job[]>('SELECT * FROM jobs WHERE id = ?', [id])
    setJobs((prev) => prev.map((j) => (j.id === id ? job : j)))
    return job
  }, [])

  const deleteJob = useCallback(async (id: number) => {
    const db = await getDb()
    await db.execute('DELETE FROM jobs WHERE id = ?', [id])
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }, [])

  return { jobs, loading, createJob, updateJob, deleteJob, reload: load }
}
