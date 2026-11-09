import type { RecipeAnalysis } from '../types/api'
import { fmtPrice, fmtPct } from '../utils/format'
import { RecipeTree } from './RecipeTree'

export function RecipeCard({ a }: { a: RecipeAnalysis }) {
  const perks = a.requirements.perks ?? {}
  const features = a.requirements.features ?? []

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
        <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Ингредиенты</div>
        <RecipeTree ingredients={a.ingredients} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800 text-sm">
        <Stat label="Себестоимость" value={fmtPrice(a.total_cost)} />
        <Stat label="Выручка брутто" value={fmtPrice(a.revenue_gross)} />
        <Stat label={`Комиссия (${a.fee_pct}%)`} value={fmtPrice(a.fee_amount)} />
        <Stat label="Выручка нетто" value={fmtPrice(a.revenue_net)} />
      </div>

      {a.missing_ingredients > 0 && (
        <div className="text-xs text-rose-400">⚠️ Нет цен на {a.missing_ingredients} ингредиент(ов)</div>
      )}
      {a.missing_energy && (
        <div className="text-xs text-rose-400">⚠️ Нет цены на 401j (энергия)</div>
      )}
      {a.partial && (
        <div className="text-xs text-amber-400">⚠️ Приблизительный расчёт (ignore-missing)</div>
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
