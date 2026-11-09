import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { api } from '../api/client'
import type { HistoryResp } from '../types/api'
import { ItemPicker } from '../components/ItemPicker'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorBox } from '../components/ErrorBox'
import { fmtPrice } from '../utils/format'

export function HistoryPage() {
  const [itemId, setItemId] = useState('')
  const [limit, setLimit] = useState(200)
  const [show, setShow] = useState(30)
  const [page, setPage] = useState(0)
  const [sort, setSort] = useState<'newest' | 'oldest' | 'price-asc' | 'price-desc'>('newest')
  const [days, setDays] = useState<number | ''>('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<HistoryResp | null>(null)

  async function run(p = page) {
    if (loading || !itemId) return
    setLoading(true); setError(null)
    try {
      const r = await api.history({
        item_id: itemId, limit, show, page: p, sort,
        days: days === '' ? undefined : days,
      })
      setData(r)
      setPage(r.page)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Данные для графика: берем цену и количество
  const chartData = (data?.deals ?? [])
    .filter(d => d.time)
    .map(d => ({
      t: new Date(d.time!).toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
      }),
      price: Math.round(d.unit),
      amount: d.amount,
    }))
    .reverse()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">🧾 История покупок</h1>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
        <ItemPicker value={itemId} onChange={setItemId} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Num label="Лимит запроса" value={limit} onChange={setLimit} />
          <Num label="Записей на странице" value={show} onChange={setShow} />
          <div>
            <label className="block text-xs text-slate-400 mb-1">Дней (пусто = все)</label>
            <input type="number" value={days}
              onChange={e => setDays(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Сортировка</label>
            <select value={sort} onChange={e => setSort(e.target.value as any)}
              className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1.5 text-sm">
              <option value="newest">Сначала новые</option>
              <option value="oldest">Сначала старые</option>
              <option value="price-asc">Сначала дешевые</option>
              <option value="price-desc">Сначала дорогие</option>
            </select>
          </div>
        </div>

        <button onClick={() => run(0)} disabled={loading || !itemId}
          className="rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-2 text-sm font-semibold">
          {loading ? 'Загрузка…' : 'Запросить историю'}
        </button>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorBox error={error} />}

      {data && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            {data.item_name}
          </h2>

          {data.stats.n_deals !== undefined ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Stat label="Сделок" value={String(data.stats.n_deals)} />
              <Stat label="Единиц" value={String(data.stats.total_units ?? '—')} />
              <Stat label="Сумма" value={fmtPrice(data.stats.total_rub)} />
              <Stat label="Медиана" value={fmtPrice(data.stats.median)} />
              <Stat label="Медиана (без 10% краев)" value={fmtPrice(data.stats.median_trim10)} />
              <Stat label="Минимальная цена" value={fmtPrice(data.stats.min)} />
              <Stat label="Максимальная цена" value={fmtPrice(data.stats.max)} />
            </div>
          ) : (
            <div className="text-sm text-slate-500">{data.stats.empty_reason ?? 'Нет данных'}</div>
          )}

          {chartData.length > 1 && (
            <div className="h-64 rounded-xl border border-slate-800 bg-slate-900/40 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis dataKey="t" stroke="#64748b" fontSize={11} minTickGap={30} />
                  <YAxis stroke="#64748b" fontSize={11} domain={['auto', 'auto']} />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '3 3' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    name="Цена" 
                    stroke="#34d399" 
                    strokeWidth={2}
                    dot={false} 
                    activeDot={{ r: 4, fill: '#34d399', stroke: '#0f172a' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="text-left px-3 py-2">Время</th>
                  <th className="text-right px-3 py-2">Цена/шт</th>
                  <th className="text-right px-3 py-2">Кол-во</th>
                  <th className="text-right px-3 py-2">Итого</th>
                </tr>
              </thead>
              <tbody>
                {data.deals.map((d, i) => (
                  <tr key={i} className="border-t border-slate-800 hover:bg-slate-900/50">
                    <td className="px-3 py-1.5 text-slate-300">
                      {d.time ? new Date(d.time).toLocaleString('ru-RU') : '—'}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono">{fmtPrice(d.unit)}</td>
                    <td className="px-3 py-1.5 text-right">{d.amount}</td>
                    <td className="px-3 py-1.5 text-right font-mono">{fmtPrice(d.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.total_pages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <button disabled={page === 0} onClick={() => run(page - 1)}
                className="rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 px-3 py-1.5">
                ← Назад
              </button>
              <span className="text-slate-400">Страница {page + 1} из {data.total_pages}</span>
              <button disabled={page >= data.total_pages - 1} onClick={() => run(page + 1)}
                className="rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 px-3 py-1.5">
                Вперёд →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Кастомный тултип для графика
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="rounded-md border border-slate-700 bg-slate-900/95 p-2 text-sm shadow-xl backdrop-blur">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="font-semibold text-emerald-400">
          Цена: {data.price.toLocaleString('ru-RU')} ₽/шт
        </p>
        <p className="text-slate-300">
          Куплено: <span className="font-bold">{data.amount} шт</span>
        </p>
      </div>
    )
  }
  return null
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-900/60 border border-slate-800 px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-semibold font-mono">{value}</div>
    </div>
  )
}

function Num({ label, value, onChange }:
  { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <input type="number" value={value}
        onChange={e => onChange(parseInt(e.target.value) || 0)}
        className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1.5 text-sm" />
    </div>
  )
}