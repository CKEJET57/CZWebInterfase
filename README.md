# CZWebInterfase

React + Vite + TypeScript + Tailwind. Отдельный проект, ходит на бэкенд по `VITE_API_URL`.

## Требования

- Node.js 20+
- Запущенный бэкенд (`python server.py` из репо `CZCraftCalc`, порт 8000)

## Быстрый старт (локально)

```bash
git clone <этот-репо> stalcraft-frontend
cd stalcraft-frontend
npm install
cp .env.example .env.local      # при необходимости поправить VITE_API_URL
npm run dev
