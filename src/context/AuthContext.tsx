import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiRequest } from '../lib/api'

export interface User {
  id: string
  email: string
  fullName: string
  role: 'ADMIN' | 'APPROVER' | 'PROCUREMENT_OFFICER' | 'FINANCE_OFFICER' | 'DEPARTMENT_USER' | 'AUDITOR'
  department: string
  avatarUrl?: string
}

export type EnterpriseRole = 'Management' | 'Purchase Manager' | 'Purchase Executive' | 'Quality' | 'Stores' | 'Accounts'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  activeRole: EnterpriseRole
  setActiveRole: (role: EnterpriseRole) => void
  login: (token: string, user: User) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('slt_token'))
  const [isLoading, setIsLoading] = useState(true)
  const [activeRole, setActiveRoleState] = useState<EnterpriseRole>(
    (localStorage.getItem('slt_active_role') as EnterpriseRole) || 'Management'
  )

  const setActiveRole = (role: EnterpriseRole) => {
    localStorage.setItem('slt_active_role', role)
    setActiveRoleState(role)
  }

  useEffect(() => {
    async function verifyAuth() {
      const storedToken = localStorage.getItem('slt_token')
      if (!storedToken) {
        setIsLoading(false)
        return
      }

      try {
        const res = await apiRequest<{ success: boolean; user: User }>('/auth/me')
        if (res.success && res.user) {
          setUser(res.user)
          setToken(storedToken)
        } else {
          localStorage.removeItem('slt_token')
          setUser(null)
          setToken(null)
        }
      } catch (err) {
        localStorage.removeItem('slt_token')
        setUser(null)
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    verifyAuth()
  }, [])

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('slt_token', newToken)
    setToken(newToken)
    setUser(newUser)
  }

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
    } catch (e) {
      // Continue client cleanup even if network request fails
    } finally {
      localStorage.removeItem('slt_token')
      setToken(null)
      setUser(null)
      window.location.href = '/login'
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, activeRole, setActiveRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
