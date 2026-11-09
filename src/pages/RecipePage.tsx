import { useState } from 'react'
import { api } from '../api/client'
import type { RecipeResp } from '../types/api'
import { ItemPicker } from '../components/ItemPicker'
import { RecipeCard } from '../components/RecipeCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorBox } from '../components/ErrorBox'

export function RecipePage() {
  const [itemId, setItemId] = useState('')
  const [recursive, setRecursive] = useState(true)
  const [noHistory, setNoHistory] = useState(true)
  const [fee, setFee] = useState(5)
  const [maxDepth, setMaxDepth] = useState(12)
  const [workers, setWorkers] = useState(4)
  const [ignoreMissing, setIgnoreMissing] = useState(false)
  
  // Состояния для исключений
  const [excludedIds, setExcludedIds] = useState<string[]>([])
  const [lastRunExcludedIds, setLastRunExcludedIds] = useState<string[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<RecipeResp | null>(null)
  const [elapsed, setElapsed] = useState<number | null>(null)

  const toggleExclude = (id: string) => {
    setExcludedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const hasPendingChanges = 
    excludedIds.length !== lastRunExcludedIds.length || 
    excludedIds.some(id => !lastRunExcludedIds.includes(id))

  async function run() {
    if (!itemId || loading) return
    setLoading(true); setError(null); setData(null); setElapsed(null)
    const t0 = performance.now()

    try {
      const r = await api.recipe({
        item_id: itemId, recursive, no_history: noHistory, fee,
        max_depth: maxDepth, workers, ignore_missing: ignoreMissing,
        exclude: excludedIds,
      })
      setData(r)
      setLastRunExcludedIds(excludedIds)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
      setElapsed((performance.now() - t0) / 1000)
    }
  }

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold">🧮 Расчёт рецепта</h1>

      {hasPendingChanges && !loading && (
        <div className="sticky top-4 z-20 flex justify-center animate-in fade-in slide-in-from-top-4">
          <button onClick={run}
            className="rounded-full bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 text-sm font-bold shadow-lg shadow-emerald-900/50 flex items-center gap-2 text-white transition">
            <span className="text-lg">🔄</span> 
            Пересчитать (на складе: {excludedIds.length})
          </button>
        </div>
      )}

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Предмет</label>
          <ItemPicker value={itemId} onChange={setItemId} craftable />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Num label="Комиссия аукциона (%)" value={fee} onChange={setFee} step={0.5} />
          <Num label="Макс. глубина" value={maxDepth} onChange={setMaxDepth} />
          <Num label="Потоков (запросов)" value={workers} onChange={setWorkers} />
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <Check label="Рекурсивный крафт" checked={recursive} onChange={setRecursive} />
          <Check label="Без истории (только лоты)" checked={noHistory} onChange={setNoHistory} />
          <Check label="Игнорировать ошибки цен" checked={ignoreMissing} onChange={setIgnoreMissing} />
        </div>

        <button onClick={run} disabled={loading || !itemId}
          className="rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-2 text-sm font-semibold">
          {loading ? 'Считаю…' : 'Запустить анализ'}
        </button>
      </div>

      {loading && (
        <div className="space-y-1">
          <LoadingSpinner label="Prefetch + анализ. Первый запрос может занять 30–90 сек." />
          <div className="text-xs text-slate-500">Долго? Уменьшите Макс. глубину или выключите Рекурсивный крафт.</div>
        </div>
      )}
      {error && <ErrorBox error={error} />}
      {data && elapsed !== null && (
        <div className="text-xs text-slate-500">Готово за {elapsed.toFixed(1)} с</div>
      )}
      
      {data?.recipes.map((a, i) => (
        <RecipeCard 
          key={i} 
          a={a} 
          excludedIds={excludedIds}
          onToggleExclude={toggleExclude}
        />
      ))}
    </div>
  )
}

function Num({ label, value, onChange, step = 1 }:
  { label: string; value: number; onChange: (n: number) => void; step?: number }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <input type="number" step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1.5 text-sm" />
    </div>
  )
}

function Check({ label, checked, onChange }:
  { label: string; checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className="h-4 w-4 accent-emerald-500" />
      {label}
    </label>
  )
}