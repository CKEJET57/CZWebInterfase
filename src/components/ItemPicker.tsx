import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import type { Item } from '../types/api'
import { useDebounce } from '../hooks/useDebounce'

interface Props {
  value: string
  onChange: (itemId: string) => void
  placeholder?: string
}

export function ItemPicker({ value, onChange, placeholder }: Props) {
  const [query, setQuery] = useState(value)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounced = useDebounce(query, 300)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api.items(debounced || undefined)
      .then(r => { if (!cancelled) setItems(r.slice(0, 50)) })
      .catch(() => { if (!cancelled) setItems([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [debounced])

  const filtered = useMemo(() => {
    if (!query) return items
    const q = query.toLowerCase()
    return items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.item_id.toLowerCase().includes(q)
    )
  }, [items, query])

  return (
    <div className="relative">
      <input
        className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
        placeholder={placeholder ?? 'Поиск по названию или item_id'}
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-80 overflow-auto rounded-md border border-slate-700 bg-slate-900 shadow-xl">
          {loading && <div className="px-3 py-2 text-xs text-slate-500">Загрузка…</div>}
          {!loading && filtered.length === 0 && (
            <div className="px-3 py-2 text-xs text-slate-500">Ничего не найдено</div>
          )}
          {filtered.map(i => (
            <button
              key={i.item_id}
              type="button"
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-800 flex justify-between gap-2"
              onMouseDown={e => e.preventDefault()}
              onClick={() => {
                onChange(i.item_id)
                setQuery(i.name)
                setOpen(false)
              }}
            >
              <span className="truncate">{i.name}</span>
              <span className="text-xs text-slate-500 font-mono">{i.item_id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
