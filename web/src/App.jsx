import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

const LandingPage = lazy(() => import('./landing/LandingPage').then((mod) => ({ default: mod.LandingPage })))
const DashboardPage = lazy(() =>
  import('./dashboard/DashboardPage').then((mod) => ({ default: mod.DashboardPage })),
)

function RouteFallback() {
  return (
    <div className="page-shell route-fallback" role="status" aria-live="polite">
      Loading module...
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
