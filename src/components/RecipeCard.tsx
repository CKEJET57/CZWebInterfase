import type { RecipeAnalysis } from '../types/api'
import { fmtPrice, fmtPct, sourceTag } from '../utils/format'
import { getPerkLabel, getFeatureLabel } from '../utils/recipeLabels'
import { RecipeTree } from './RecipeTree'

interface RecipeCardProps {
  a: RecipeAnalysis
  excludedIds?: string[]
  onToggleExclude?: (id: string) => void
  bare?: boolean
  hideHeader?: boolean
}

export function RecipeCard({
  a,
  excludedIds = [],
  onToggleExclude,
  bare = false,
  hideHeader = false,
}: RecipeCardProps) {
  const perks = a.requirements?.perks ?? {}
  const features = a.requirements?.features ?? []

  const fullTree = a.full_tree || {}
  const fullTreeList = Object.entries(fullTree).map(([id, data]) => ({
    id,
    ...data,
  })).sort((x, y) => (x.name || x.id).localeCompare(y.name || y.id))

  const wrapperCls = bare
    ? 'space-y-3'
    : 'rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3'

  return (
    <div className={wrapperCls}>
      {!hideHeader && (
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-lg font-semibold">
              {a.result_name} <span className="text-slate-500">×{a.result_amount}</span>
            </h3>
            <div className="text-xs text-slate-400">
              {a.category} / {a.subcategory}
            </div>
          </div>
        </div>
      )}
      {a.kind !== 'barter' && (
        <div className="text-xs text-slate-400 flex flex-col gap-2 mt-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500">Навыки:</span>
            {Object.keys(perks).length > 0 ? (
              Object.entries(perks).map(([key, lvl]) => (
                <span key={key} className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">
                  {getPerkLabel(key)} <span className="text-[10px] text-slate-500 font-mono">(ур.{lvl})</span>
                </span>
              ))
            ) : (
              <span>—</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500">Оборудование:</span>
            {features.length > 0 ? (
              features.map(f => (
                <span key={f} className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">
                  {getFeatureLabel(f)}
                </span>
              ))
            ) : (
              <span>—</span>
            )}
          </div>
        </div>
      )}

      <div className="border-t border-slate-800 pt-2">
        <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Ингредиенты (дерево)</div>
        <RecipeTree ingredients={a.ingredients} />
      </div>

      {a.kind !== 'barter' && (
        <div className="pt-2 border-t border-slate-800">
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Экономика</div>
          <EconomyTable analysis={a} />
        </div>
      )}

      {fullTreeList.length > 0 && (
        <div className="pt-4 border-t border-slate-800">
          <div className="text-sm font-semibold text-emerald-300 flex items-center gap-2 mb-2">
            🌳 Базовые ресурсы
            {onToggleExclude && (
              <span className="text-xs font-normal text-slate-500">(кликните, чтобы добавить/убрать со склада)</span>
            )}
          </div>
          <div className="max-h-60 overflow-y-auto rounded border border-slate-800 bg-slate-900/60 divide-y divide-slate-800/50 text-sm">
            {fullTreeList.map(i => {
              const isExcluded = excludedIds.includes(i.id)
              return (
                <ResourceRow
                  key={i.id}
                  item={i}
                  isExcluded={isExcluded}
                  onToggle={onToggleExclude ? () => onToggleExclude(i.id) : undefined}
                  hideTag={a.kind === 'barter'}
                />
              )
            })}
          </div>
        </div>
      )}

      {a.kind !== 'barter' && a.missing_ingredients > 0 && (
        <div className="text-xs text-rose-400 pt-2">⚠️ Нет цен на {a.missing_ingredients} ингредиент(ов)</div>
      )}
      {a.kind !== 'barter' && a.missing_energy && (
        <div className="text-xs text-rose-400 pt-2">⚠️ Нет цены на 401j (энергия)</div>
      )}
      {a.kind !== 'barter' && a.partial && (
        <div className="text-xs text-amber-400 pt-2">⚠️ Приблизительный расчёт (ignore-missing)</div>
      )}
    </div>
  )
}

function EconomyTable({ analysis }: { analysis: RecipeAnalysis }) {
  const n = analysis.result_amount || 1
  const showBatch = n > 1

  const perUnit = (v: number | null | undefined) => (v != null ? v / n : null)

  const margin = analysis.margin_pct
  const marginCls = (margin ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'

  const rows: {
    label: string
    unit: number | null
    batch: number | null
    cls?: string
    sign?: boolean
    large?: boolean
  }[] = [
    {
      label: 'Себестоимость',
      unit: perUnit(analysis.total_cost),
      batch: analysis.total_cost,
    },
    {
      label: 'Выручка брутто',
      unit: perUnit(analysis.revenue_gross),
      batch: analysis.revenue_gross,
    },
    {
      label: `Комиссия (${analysis.fee_pct}%)`,
      unit: perUnit(analysis.fee_amount),
      batch: analysis.fee_amount,
    },
    {
      label: 'Выручка нетто',
      unit: perUnit(analysis.revenue_net),
      batch: analysis.revenue_net,
    },
    {
      label: 'Прибыль',
      unit: perUnit(analysis.profit),
      batch: analysis.profit,
      cls: (analysis.profit ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400',
      sign: true,
      large: true,
    },
  ]

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-800/60">
          <tr className="text-xs uppercase tracking-wide text-slate-400">
            <th className="text-left px-3 py-2 font-medium">Показатель</th>
            <th className="text-right px-3 py-2 font-medium w-32">1 ед., р.</th>
            {showBatch && (
              <th className="text-right px-3 py-2 font-medium w-40">Партия ×{n}, р.</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {rows.map((r) => {
            const cls = r.cls ?? 'text-slate-200'
            const batchCls = r.cls ?? 'text-slate-400'
            const sizeCls = r.large ? 'text-base font-semibold' : ''
            return (
              <tr key={r.label} className="hover:bg-slate-800/30">
                <td className={`px-3 py-1.5 text-slate-300 ${r.large ? 'font-semibold' : ''}`}>
                  {r.label}
                </td>
                <td className={`px-3 py-1.5 text-right font-mono ${cls} ${sizeCls}`}>
                  {r.unit != null ? `${r.sign && r.unit > 0 ? '+' : ''}${fmtPrice(r.unit)}` : '—'}
                </td>
                {showBatch && (
                  <td className={`px-3 py-1.5 text-right font-mono ${batchCls} ${sizeCls}`}>
                    {r.batch != null ? `${r.sign && r.batch > 0 ? '+' : ''}${fmtPrice(r.batch)}` : '—'}
                  </td>
                )}
              </tr>
            )
          })}
          <tr className="bg-slate-800/40">
            <td className="px-3 py-1.5 text-slate-300 font-semibold">Маржинальность</td>
            <td
              colSpan={showBatch ? 2 : 1}
              className={`px-3 py-1.5 text-right font-mono text-base font-semibold ${marginCls}`}
            >
              {fmtPct(margin)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function ResourceRow({
  item, isExcluded, onToggle, hideTag = false,
}: {
  item: { id: string; amount: number; source: string; name?: string }
  isExcluded: boolean
  onToggle?: () => void
  hideTag?: boolean
}) {
  const tag = sourceTag(isExcluded ? 'excluded' : 'market')

  return (
    <div
      onClick={onToggle}
      className={`flex items-center gap-3 px-3 py-1.5 transition select-none ${
        onToggle ? 'cursor-pointer' : 'cursor-default'
      } ${
        isExcluded
          ? 'bg-slate-800/80 ring-1 ring-inset ring-amber-500/30'
          : 'hover:bg-slate-800/50'
      }`}
    >
      {!hideTag && (
        <span className={`w-12 text-center px-1 py-0.5 rounded text-[10px] font-medium shrink-0 ${tag.cls}`}>
          {tag.label}
        </span>
      )}

      <span className="flex-1 truncate text-slate-300" title={item.name || item.id}>
        {item.name || item.id}
      </span>

      <span className="w-12 text-right font-mono font-semibold text-slate-200">×{item.amount}</span>
    </div>
  )
}