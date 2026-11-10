// ─── Базовые запросы ───
export interface AnalysisReqBase {
  region?: string
  lang?: string
  fee?: number
  recursive?: boolean
  max_depth?: number
  no_fallback?: boolean
  no_history?: boolean
  workers?: number
  ignore_missing?: boolean
  exclude?: string[]
  use_local_data?: boolean
}

export interface RecipeReq extends AnalysisReqBase {
  item_id: string
}

export interface BatchReq extends AnalysisReqBase {
  bench?: 'workbench' | 'laboratory_table' | 'kitchen_table'
  category?: string
  perk?: string
  per_category?: boolean
  top?: number
  max_recipes?: number
  sort?: 'margin' | 'profit'
}

export interface HistoryReq {
  item_id: string
  region?: string
  lang?: string
  no_history?: boolean
  limit?: number
  sort?: 'newest' | 'oldest' | 'price-asc' | 'price-desc'
  days?: number
  show?: number
  page?: number
}

// ─── Дерево крафта ───
export interface CostNode {
  item_id: string
  name?: string
  amount: number
  cost: number | null
  source: 'market' | 'craft' | 'excluded' | 'none'
  unit_price: number | null
  market_cost: number | null
  craft_cost: number | null
  craft_runs: number
  craft_yield: number
  ingredients_cost: number | null
  energy_cost: number | null
  why: string
  children?: CostNode[]
  children_count?: number
}

export interface Ingredient {
  item_id: string
  name: string
  amount: number
  unit_price: number | null
  total_price: number | null
  source: string
  craft_path: CostNode | null
}

// ─── Анализ рецепта ───
export interface RecipeAnalysis {
  result_item_id: string
  result_name: string
  result_amount: number
  category: string
  subcategory: string
  bench: string
  requirements: {
    perks?: Record<string, number>
    features?: string[]
  }
  ingredients: Ingredient[]
  ingredients_cost: number | null
  energy: number
  energy_cost: number | null
  total_cost: number | null
  revenue_gross: number | null
  fee_pct: number
  fee_amount: number | null
  revenue_net: number | null
  profit: number | null
  margin_pct: number | null
  missing_ingredients: number
  missing_energy: boolean
  partial: boolean
  excluded_summary: Record<string, number>
  required_total: Record<string, { amount: number; source: string; name?: string }>
  full_tree: Record<string, { amount: number; source: string; name?: string }>
}

export interface RecipeResp {
  item_id: string
  recipes: RecipeAnalysis[]
}

// ─── Batch ───
export interface BatchSection {
  category_id: string | null
  category_name: string
  items: RecipeAnalysis[]
}

export interface BatchResp {
  total_analyzed: number
  with_full_price: number
  without_data: number
  top_n: number
  sort: string
  per_category: boolean
  sections: BatchSection[]
}

// ─── История ───
export interface Deal {
  price: number
  amount: number
  unit: number
  time: string | null
}

export interface HistoryResp {
  item_id: string
  item_name: string
  deals: Deal[]
  stats: {
    n_deals?: number
    total_units?: number
    total_rub?: number
    min?: number
    max?: number
    median?: number
    median_trim10?: number
    empty_reason?: string
  }
  page: number
  page_size: number
  total_pages: number
  raw_sample?: unknown
}

// ─── Справочники ───
export interface Item {
  item_id: string
  name: string
}

export interface Category {
  id: string
  name: string
}

export interface ItemDetails {
  description: string | null
  color: string
  status: string
  stats: { name: string; value: string }[]
  icon_url: string | null
}

export interface InfoBlockElement {
  type: 'numeric' | 'key-value'
  name: string
  value: string
  nameColor?: string | null
  valueColor?: string | null
}

export interface InfoBlock {
  type: 'list' | 'text'
  title?: string
  elements?: InfoBlockElement[]
  text?: string
}

export interface ItemDetails {
  color: string
  status: string
  category: string
  icon_url: string | null
  blocks: InfoBlock[]
}