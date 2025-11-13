// frontend/src/components/ProtectedRoute.tsx
import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/store/auth'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const loc = useLocation()
  if (!token) return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  return <>{children}</>
}

export default ProtectedRoute
