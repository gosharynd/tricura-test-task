import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PoliciesPage from '@/features/policies/components/PoliciesPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-white">
          <header className="border-b px-6 py-3">
            <span className="text-sm text-muted-foreground">Tricura Insurance Group</span>
            <span className="text-sm text-muted-foreground mx-2">/</span>
            <span className="text-sm font-semibold">Policy Review Dashboard</span>
          </header>
          <Routes>
            <Route path="/" element={<PoliciesPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
