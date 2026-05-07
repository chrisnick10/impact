import { useState, useEffect, useCallback } from 'react'
import { getDb } from '../lib/db'
import type { Tag } from '../types'

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([])

  const load = useCallback(async () => {
    const db = await getDb()
    setTags(await db.select<Tag[]>('SELECT * FROM tags ORDER BY name ASC'))
  }, [])

  useEffect(() => { load() }, [load])

  const createTag = useCallback(async (data: { name: string; color: string }) => {
    const db = await getDb()
    const result = await db.execute('INSERT INTO tags (name, color) VALUES (?, ?)', [data.name, data.color])
    const [tag] = await db.select<Tag[]>('SELECT * FROM tags WHERE id = ?', [result.lastInsertId])
    setTags((prev) => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)))
    return tag
  }, [])

  const updateTag = useCallback(async (id: number, data: { name?: string; color?: string }) => {
    const db = await getDb()
    const entries = Object.entries(data).filter(([, v]) => v !== undefined)
    if (!entries.length) return
    const sets = entries.map(([k]) => `${k} = ?`).join(', ')
    await db.execute(`UPDATE tags SET ${sets} WHERE id = ?`, [...entries.map(([, v]) => v), id])
    const [tag] = await db.select<Tag[]>('SELECT * FROM tags WHERE id = ?', [id])
    setTags((prev) => prev.map((t) => (t.id === id ? tag : t)))
  }, [])

  const deleteTag = useCallback(async (id: number) => {
    const db = await getDb()
    await db.execute('DELETE FROM tags WHERE id = ?', [id])
    setTags((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { tags, createTag, updateTag, deleteTag, reload: load }
}
