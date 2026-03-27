/**
 * Componente Protected Route com verificação de segurança
 */
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { CircularProgress, Box } from '@mui/material'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth)

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

/**
 * Guards para verificação de autenticação
 */
export const canAccess = (userRole: string, allowedRoles: string[]): boolean => {
  return allowedRoles.includes(userRole)
}

export const requiresAuthentication = (isAuthenticated: boolean): boolean => {
  return isAuthenticated
}

export const requiresRole = (userRole: string, role: string): boolean => {
  return userRole === role
}
