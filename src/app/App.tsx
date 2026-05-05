import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
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
        <div className="min-h-screen bg-[#f4f6f8]">
          <header className="bg-white border-b border-black/12 px-6 h-14 flex items-center gap-2">
            <span className="text-sm text-black/60">Tricura Insurance Group</span>
            <span className="text-sm text-black/60">/</span>
            <span className="text-sm font-semibold text-black/87">Policy Review Dashboard</span>
          </header>
          <Routes>
            <Route path="/policies" element={<PoliciesPage />} />
            <Route path="*" element={<Navigate to="/policies" replace />} />
          </Routes>
        </div>
        <Toaster position="bottom-right" richColors />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
