import type { RecipeAnalysis } from '../types/api'
import { fmtPrice, fmtPct, sourceTag } from '../utils/format'
import { RecipeTree } from './RecipeTree'

interface RecipeCardProps {
  a: RecipeAnalysis
  excludedIds: string[]
  onToggleExclude: (id: string) => void
}

export function RecipeCard({ a, excludedIds, onToggleExclude }: RecipeCardProps) {
  const perks = a.requirements?.perks ?? {}
  const features = a.requirements?.features ?? []

  // Защита от undefined, если бэкенд старый
  const fullTree = a.full_tree || {}
  const fullTreeList = Object.entries(fullTree).map(([id, data]) => ({
    id,
    ...data
  })).sort((x, y) => (x.name || x.id).localeCompare(y.name || y.id))

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold">
            {a.result_name} <span className="text-slate-500">×{a.result_amount}</span>
          </h3>
          <div className="text-xs text-slate-400">
            {a.bench} / {a.category} / {a.subcategory}
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${(a.margin_pct ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {fmtPct(a.margin_pct)}
          </div>
          <div className="text-xs text-slate-400">{fmtPrice(a.profit)}</div>
        </div>
      </div>

      <div className="text-xs text-slate-400 flex gap-3 flex-wrap">
        <span>Перки: {Object.keys(perks).join(', ') || '—'}</span>
        <span>Фичи: {features.join(', ') || '—'}</span>
      </div>

      <div className="border-t border-slate-800 pt-2">
        <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Ингредиенты (дерево)</div>
        <RecipeTree ingredients={a.ingredients} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800 text-sm">
        <Stat label="Себестоимость" value={fmtPrice(a.total_cost)} />
        <Stat label="Выручка брутто" value={fmtPrice(a.revenue_gross)} />
        <Stat label={`Комиссия (${a.fee_pct}%)`} value={fmtPrice(a.fee_amount)} />
        <Stat label="Выручка нетто" value={fmtPrice(a.revenue_net)} />
      </div>

      {fullTreeList.length > 0 && (
        <div className="pt-4 border-t border-slate-800">
          <div className="text-sm font-semibold text-emerald-300 flex items-center gap-2 mb-2">
            🌳 Базовые ресурсы <span className="text-xs font-normal text-slate-500">(кликните, чтобы добавить/убрать со склада)</span>
          </div>
          <div className="max-h-60 overflow-y-auto rounded border border-slate-800 bg-slate-900/60 divide-y divide-slate-800/50 text-sm">
            {fullTreeList.map(i => {
              const isExcluded = excludedIds.includes(i.id)
              return (
                <ResourceRow
                  key={i.id}
                  item={i}
                  isExcluded={isExcluded}
                  onToggle={() => onToggleExclude(i.id)}
                />
              )
            })}
          </div>
        </div>
      )}

      {a.missing_ingredients > 0 && (
        <div className="text-xs text-rose-400 pt-2">⚠️ Нет цен на {a.missing_ingredients} ингредиент(ов)</div>
      )}
      {a.missing_energy && (
        <div className="text-xs text-rose-400 pt-2">⚠️ Нет цены на 401j (энергия)</div>
      )}
      {a.partial && (
        <div className="text-xs text-amber-400 pt-2">⚠️ Приблизительный расчёт (ignore-missing)</div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  )
}

function ResourceRow({ item, isExcluded, onToggle }: {
  item: { id: string; amount: number; source: string; name?: string }
  isExcluded: boolean
  onToggle: () => void
}) {
  const tag = sourceTag(isExcluded ? 'excluded' : 'market')

  return (
    <div
      onClick={onToggle}
      className={`flex items-center gap-3 px-3 py-1.5 transition select-none cursor-pointer ${
        isExcluded 
          ? 'bg-slate-800/80 ring-1 ring-inset ring-amber-500/30' 
          : 'hover:bg-slate-800/50'
      }`}
    >
      <span className={`w-12 text-center px-1 py-0.5 rounded text-[10px] font-medium shrink-0 ${tag.cls}`}>
        {tag.label}
      </span>

      <span className="flex-1 truncate text-slate-300" title={item.name || item.id}>
        {item.name || item.id}
      </span>
      
      <span className="w-12 text-right font-mono font-semibold text-slate-200">×{item.amount}</span>
    </div>
  )
}