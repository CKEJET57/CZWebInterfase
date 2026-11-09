import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { RecipePage } from './pages/RecipePage'
import { BatchPage } from './pages/BatchPage'
import { HistoryPage } from './pages/HistoryPage'
import { CharacterPage } from './pages/CharacterPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="recipe" element={<RecipePage />} />
        <Route path="batch" element={<BatchPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="character" element={<CharacterPage />} />
      </Route>
    </Routes>
  )
}