import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Item } from '../types/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorBox } from '../components/ErrorBox'

export function ExclusionsPage() {
  const [items, setItems] = useState<string[]>([])
  const [index, setIndex] = useState<Record<string, string>>({})
  const [newItems, setNewItems] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setLoading(true); setError(null)
    try {
      const [r, names] = await Promise.all([api.exclusions(), api.items()])
      setItems(r.items)
      const idx: Record<string, string> = {}
      for (const it of names as Item[]) idx[it.item_id] = it.name
      setIndex(idx)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  async function add() {
    const ids = newItems.split(/[\s,]+/).filter(Boolean)
    if (ids.length === 0) return
    await api.addExclusions(ids)
    setNewItems('')
    refresh()
  }

  async function remove(id: string) {
    await api.removeExclusions([id])
    refresh()
  }

  async function clear() {
    if (!confirm('Точно очистить все исключения?')) return
    await api.clearExclusions()
    refresh()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">🎁 Исключения (нулевая стоимость)</h1>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
        <div className="flex gap-2">
          <input value={newItems} onChange={e => setNewItems(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
            placeholder="item_id через пробел или запятую"
            className="flex-1 rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm" />
          <button onClick={add} disabled={!newItems.trim()}
            className="rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-3 py-2 text-sm">
            Добавить
          </button>
          <button onClick={clear} disabled={items.length === 0}
            className="rounded-md bg-rose-600/80 hover:bg-rose-500 disabled:opacity-50 px-3 py-2 text-sm">
            Очистить
          </button>
        </div>

        {loading && <LoadingSpinner />}
        {error && <ErrorBox error={error} />}

        {items.length === 0 && !loading && (
          <div className="text-sm text-slate-500">Исключений нет</div>
        )}

        {items.length > 0 && (
          <div className="space-y-1">
            {items.map(id => (
              <div key={id} className="flex items-center gap-3 px-3 py-1.5 rounded hover:bg-slate-900/60">
                <span className="w-16 font-mono text-xs text-slate-500">{id}</span>
                <span className="flex-1 truncate">{index[id] ?? '—'}</span>
                <button onClick={() => remove(id)}
                  className="text-xs text-rose-400 hover:text-rose-300">удалить</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
