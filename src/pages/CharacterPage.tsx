import { useState } from 'react'
import { api } from '../api/client'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorBox } from '../components/ErrorBox'

export function CharacterPage() {
  const [name, setName] = useState('')
  const [region, setRegion] = useState('RU')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Record<string, unknown> | null>(null)

  async function run() {
    if (!name || loading) return
    setLoading(true); setError(null); setData(null)
    try {
      setData(await api.character({ name, region }))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">🧑 Профиль персонажа</h1>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex gap-3">
        <input value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && run()}
          placeholder="Ник персонажа"
          className="flex-1 rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm" />
        <input value={region} onChange={e => setRegion(e.target.value.toUpperCase())}
          className="w-24 rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm" />
        <button onClick={run} disabled={loading || !name}
          className="rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-2 text-sm font-semibold">
          {loading ? '…' : 'Найти'}
        </button>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorBox error={error} />}
      {data && (
        <pre className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 overflow-auto text-xs">
{JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}
