import type {
  BatchReq, BatchResp, Category, HistoryReq, HistoryResp,
  Item, RecipeReq, RecipeResp,
} from '../types/api'

const RAW = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'
const BASE = RAW.replace(/\/+$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let r: Response
  try {
    r = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch (e) {
    throw new Error(
      `Не удалось связаться с API по адресу ${BASE}. ` +
      `Проверьте, что бэкенд запущен и CORS разрешён. ` +
      `(${(e as Error).message})`
    )
  }
  if (!r.ok) {
    let msg = `${r.status} ${r.statusText}`
    try {
      const j = await r.json()
      if (j?.error) msg = j.error
      else if (j?.detail) msg = j.detail
    } catch {}
    throw new Error(msg)
  }
  return r.json() as Promise<T>
}

export const api = {
  baseUrl: BASE,

  health: () => request<{ ok: boolean }>('/health'),
  items: (q?: string, craftable?: boolean) => {
    const params = new URLSearchParams()
    if (q) params.append('q', q)
    if (craftable) params.append('craftable', 'true')
    const qs = params.toString()
    return request<Item[]>(`/items${qs ? `?${qs}` : ''}`)
  },
  categories: () => request<Category[]>('/categories'),

  recipe: (body: RecipeReq) =>
    request<RecipeResp>('/recipe', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  batch: (body: BatchReq) =>
    request<BatchResp>('/batch', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  history: (body: HistoryReq) =>
    request<HistoryResp>('/history', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  character: (body: { name: string; region?: string }) =>
    request<Record<string, unknown>>('/character', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
}