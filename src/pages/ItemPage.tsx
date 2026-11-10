import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { api } from '../api/client'
import type { HistoryResp, RecipeAnalysis, ItemDetails } from '../types/api'
import { ItemPicker } from '../components/ItemPicker'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorBox } from '../components/ErrorBox'
import { fmtPrice } from '../utils/format'

export function ItemPage() {
  const [itemId, setItemId] = useState('')
  const [historyData, setHistoryData] = useState<HistoryResp | null>(null)
  const [recipeData, setRecipeData] = useState<RecipeAnalysis[] | null>(null)
  const [itemDetails, setItemDetails] = useState<ItemDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart')
  const [page, setPage] = useState(0)
  const [limit] = useState(200)
  const [show] = useState(30)

  async function loadItemData(id: string, p = 0) {
    if (!id || loading) return
    setLoading(true); setError(null); setHistoryData(null); setRecipeData(null); setItemDetails(null); setPage(p)

    try {
      const historyPromise = api.history({ item_id: id, limit, show, page: p, sort: 'newest' })
      const recipePromise = api.recipe({ item_id: id, recursive: false, no_history: true, fee: 0 }).catch(() => null)
      const detailsPromise = api.itemDetails(id).catch(() => null)

      const [hRes, rRes, dRes] = await Promise.all([historyPromise, recipePromise, detailsPromise])

      setHistoryData(hRes)
      if (rRes) setRecipeData(rRes.recipes)
      if (dRes) setItemDetails(dRes)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Определяем, броня это или одежда
  const isArmorOrClothes = itemDetails?.category?.includes('armor') || itemDetails?.category?.includes('clothes')

  const chartData = (historyData?.deals ?? []).filter(d => d.time).map(d => ({
    t: new Date(d.time!).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
    price: Math.round(d.unit),
    amount: d.amount,
  })).reverse()

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold">📋 Список предметов</h1>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <label className="block text-xs text-slate-400 mb-1">Выберите предмет</label>
        <div className="flex gap-3">
          <div className="flex-1">
            <ItemPicker value={itemId} onChange={(id) => { setItemId(id); loadItemData(id) }} />
          </div>
          <button onClick={() => loadItemData(itemId)} disabled={loading || !itemId}
            className="rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-6 py-2 text-sm font-semibold">
            Загрузить
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner label="Загрузка данных..." />}
      {error && <ErrorBox error={error} />}

      {!loading && historyData && (
        <div className="space-y-4 animate-in fade-in duration-300">
          
          {/* БЛОК 1: ОПИСАНИЕ */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex gap-4 mb-4">
              {itemDetails?.icon_url && (
                <div className="shrink-0">
                  <img src={itemDetails.icon_url} alt={historyData.item_name}
                    className="w-20 h-20 object-contain rounded border border-slate-700 bg-slate-900/60 p-1"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
              )}
              
              <div className="flex-1">
                {/* Пункт 1: Перенесли название вместо надписи */}
                <h2 className="text-xl font-bold text-slate-100 mb-2">
                  {historyData.item_name}
                </h2>
                {itemDetails && (
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      Ранг: {itemDetails.color.replace('RANK_', '').toLowerCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {itemDetails ? (
              <div className="space-y-4 mt-4 border-t border-slate-800/50 pt-4">
                {itemDetails.blocks.map((block, idx) => {
                  const hasTitle = Boolean(block.title);
                  
                  const content = (
                    <>
                      {block.type === 'list' && block.elements && (
                        /* Пункт 2: Все статы в один столбик (flex-col) */
                        <div className="flex flex-col gap-1 mt-2">
                          {block.elements.map((el, i) => (
                            <div key={i} className="flex justify-between text-sm px-2 py-1 hover:bg-slate-800/30 rounded">
                              <span style={{ color: el.nameColor ? `#${el.nameColor}` : '#94a3b8' }}>{el.name}</span>
                              <span className="font-semibold font-mono" style={{ color: el.valueColor ? `#${el.valueColor}` : '#fff' }}>{el.value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {block.type === 'text' && (
                        /* whitespace-pre-wrap уже обрабатывает \n */
                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap mt-1">
                          {block.text}
                        </p>
                      )}
                    </>
                  );

                  /* Пункт 3: Для брони/одежды не делаем сворачиваемые аккордеоны, а выводим просто заголовок */
                  if (hasTitle && !isArmorOrClothes) {
                    return (
                      <details key={idx} className="group" open>
                        <summary className="cursor-pointer text-xs font-semibold text-emerald-400/80 hover:text-emerald-400 uppercase tracking-wider select-none flex items-center gap-2">
                          <span className="transition-transform group-open:rotate-90">▶</span>
                          {block.title}
                        </summary>
                        <div className="pl-4 mt-2 border-l border-slate-800">
                          {content}
                        </div>
                      </details>
                    );
                  }

                  return (
                    <div key={idx} className="mt-4">
                      {hasTitle && (
                         <div className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider mb-2">
                           {block.title}
                         </div>
                      )}
                      {content}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-slate-500 italic mt-4 border-t border-slate-800/50 pt-4">Детальная информация не найдена.</div>
            )}
          </div>

          {/* БЛОК 2: РЕЦЕПТ */}
          {recipeData && recipeData.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Рецепт</h3>
              <div className="space-y-6">
                {recipeData.map((r, i) => (
                  <div key={i} className="border-l-2 border-emerald-500/30 pl-4">
                    <div className="text-xs text-slate-400 mb-3">
                      Верстак: <span className="text-slate-300">{r.bench}</span> • Выход: <span className="text-slate-300">{r.result_amount} шт.</span>
                    </div>
                    <div className="space-y-1.5">
                      {r.ingredients.map(ing => (
                        <div key={ing.item_id} className="flex items-center justify-between text-sm text-slate-300 max-w-md hover:bg-slate-800/50 px-2 py-1 rounded">
                          <span>{ing.name}</span>
                          <span className="font-mono text-slate-400">×{ing.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* БЛОК 3: ИСТОРИЯ СДЕЛОК */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">История сделок</h3>
              <div className="flex bg-slate-900 rounded-md p-1 border border-slate-800">
                <button onClick={() => setViewMode('chart')}
                  className={`px-3 py-1 text-xs rounded transition ${viewMode === 'chart' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                  График
                </button>
                <button onClick={() => setViewMode('list')}
                  className={`px-3 py-1 text-xs rounded transition ${viewMode === 'list' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                  Список
                </button>
              </div>
            </div>

            {!historyData.stats.n_deals ? (
              <div className="text-sm text-slate-500">{historyData.stats.empty_reason ?? 'Нет данных о сделках'}</div>
            ) : viewMode === 'chart' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <Stat label="Сделок" value={String(historyData.stats.n_deals)} />
                  <Stat label="Медиана" value={fmtPrice(historyData.stats.median)} />
                  <Stat label="Мин. цена" value={fmtPrice(historyData.stats.min)} />
                  <Stat label="Макс. цена" value={fmtPrice(historyData.stats.max)} />
                </div>
                <div className="h-64 bg-slate-900/60 rounded border border-slate-800 p-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                      <XAxis dataKey="t" stroke="#64748b" fontSize={11} minTickGap={30} />
                      <YAxis stroke="#64748b" fontSize={11} domain={['auto', 'auto']} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '3 3' }} />
                      <Line type="monotone" dataKey="price" name="Цена" stroke="#34d399" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#34d399', stroke: '#0f172a' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded border border-slate-800 overflow-hidden">
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
                      {historyData.deals.map((d, i) => (
                        <tr key={i} className="border-t border-slate-800 hover:bg-slate-900/50">
                          <td className="px-3 py-1.5 text-slate-300">{d.time ? new Date(d.time).toLocaleString('ru-RU') : '—'}</td>
                          <td className="px-3 py-1.5 text-right font-mono">{fmtPrice(d.unit)}</td>
                          <td className="px-3 py-1.5 text-right">{d.amount}</td>
                          <td className="px-3 py-1.5 text-right font-mono">{fmtPrice(d.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {historyData.total_pages > 1 && (
                  <div className="flex items-center justify-between text-sm">
                    <button disabled={page === 0} onClick={() => loadItemData(itemId, page - 1)} className="rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 px-3 py-1.5">← Назад</button>
                    <span className="text-slate-400">Стр. {page + 1} из {historyData.total_pages}</span>
                    <button disabled={page >= historyData.total_pages - 1} onClick={() => loadItemData(itemId, page + 1)} className="rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 px-3 py-1.5">Вперёд →</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="rounded-md border border-slate-700 bg-slate-900/95 p-2 text-sm shadow-xl backdrop-blur">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="font-semibold text-emerald-400">Цена: {data.price.toLocaleString('ru-RU')} ₽/шт</p>
        <p className="text-slate-300">Куплено: <span className="font-bold">{data.amount} шт</span></p>
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