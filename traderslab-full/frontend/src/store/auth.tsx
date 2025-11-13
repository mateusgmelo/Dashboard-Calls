import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { User } from '@/types'

type AuthState = { user: User|null; token: string|null; login: (u:User,t:string)=>void; logout:()=>void }

const AuthCtx = createContext<AuthState | null>(null)

export function AuthProvider({ children }:{children:ReactNode}){
  const [user,setUser] = useState<User|null>(null)
  const [token,setToken] = useState<string|null>(null)

  useEffect(()=>{
    const t = localStorage.getItem('accessToken')
    const u = localStorage.getItem('user')
    if (t && u) { setToken(t); setUser(JSON.parse(u)) }
  }, [])

  const login = (u:User, t:string) => {
    setUser(u); setToken(t)
    localStorage.setItem('user', JSON.stringify(u))
    localStorage.setItem('accessToken', t)
  }

  const logout = () => {
    setUser(null); setToken(null)
    localStorage.removeItem('user'); localStorage.removeItem('accessToken')
    window.location.href = '/login'
  }

  return <AuthCtx.Provider value={{ user, token, login, logout }}>{children}</AuthCtx.Provider>
}

export function useAuth(){
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}