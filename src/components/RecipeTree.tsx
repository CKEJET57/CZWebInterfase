import type { CostNode, Ingredient } from '../types/api'
import { fmtPrice, sourceTag } from '../utils/format'

export function RecipeTree({ ingredients }: { ingredients: Ingredient[] }) {
  return (
    <div className="space-y-0.5 font-mono text-sm">
      {ingredients.map((ing, i) => (
        <IngredientRow key={`${ing.item_id}-${i}`} ing={ing} depth={0} />
      ))}
    </div>
  )
}

function IngredientRow({ ing, depth }: { ing: Ingredient; depth: number }) {
  const tag = sourceTag(ing.source)
  const isCraft = ing.source === 'craft' && ing.craft_path?.children
  const pad = `${depth * 1.5}rem`

  return (
    <div>
      <div className="flex items-center gap-2 py-0.5 hover:bg-slate-900/50 rounded px-2" style={{ paddingLeft: pad }}>
        <span className="w-12 text-slate-500 truncate text-xs">{ing.item_id}</span>
        <span className="w-44 truncate">{ing.name}</span>
        <span className="w-12 text-right text-slate-400">×{ing.amount}</span>
        <span className={`px-1.5 py-0.5 rounded text-xs ${tag.cls}`}>{tag.label}</span>
        <span className="w-24 text-right text-slate-400">{fmtPrice(ing.unit_price)}</span>
        <span className="w-24 text-right font-semibold">{fmtPrice(ing.total_price)}</span>
      </div>
      {isCraft && ing.craft_path && (
        <>
          <div className="text-xs text-violet-400 py-0.5" style={{ paddingLeft: `${depth * 1.5 + 1}rem` }}>
            ↳ крафт: {ing.craft_path.craft_runs}× (выход {ing.craft_path.craft_yield}
            {ing.craft_path.energy_cost ? `, энергия ${fmtPrice(ing.craft_path.energy_cost)}` : ''})
          </div>
          {ing.craft_path.children!.map((c, i) => (
            <CostNodeRow key={`${c.item_id}-${i}`} node={c} depth={depth + 1} />
          ))}
        </>
      )}
    </div>
  )
}

function CostNodeRow({ node, depth }: { node: CostNode; depth: number }) {
  const tag = sourceTag(node.source)
  const isCraft = node.source === 'craft' && node.children?.length
  const pad = `${depth * 1.5}rem`

  return (
    <div>
      <div className="flex items-center gap-2 py-0.5 hover:bg-slate-900/50 rounded px-2" style={{ paddingLeft: pad }}>
        <span className="w-12 text-slate-500 truncate text-xs">{node.item_id}</span>
        <span className="w-44 truncate text-slate-300">{node.item_id}</span>
        <span className="w-12 text-right text-slate-400">×{node.amount}</span>
        <span className={`px-1.5 py-0.5 rounded text-xs ${tag.cls}`}>{tag.label}</span>
        <span className="w-24 text-right text-slate-400">{fmtPrice(node.unit_price)}</span>
        <span className="w-24 text-right font-semibold">{fmtPrice(node.cost)}</span>
      </div>
      {isCraft && node.children && (
        <>
          <div className="text-xs text-violet-400 py-0.5" style={{ paddingLeft: `${depth * 1.5 + 1}rem` }}>
            ↳ крафт: {node.craft_runs}× (выход {node.craft_yield}
            {node.energy_cost ? `, энергия ${fmtPrice(node.energy_cost)}` : ''})
          </div>
          {node.children.map((c, i) => (
            <CostNodeRow key={`${c.item_id}-${i}`} node={c} depth={depth + 1} />
          ))}
        </>
      )}
    </div>
  )
}
