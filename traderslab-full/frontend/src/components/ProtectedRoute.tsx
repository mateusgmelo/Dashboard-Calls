// frontend/src/components/ProtectedRoute.tsx
import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/store/auth'
import { Spin } from 'antd'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth()
  const loc = useLocation()
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }
  
  if (!token) return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  return <>{children}</>
}

export default ProtectedRoute
