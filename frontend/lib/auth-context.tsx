"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import type { User, AuthResponse } from "./types"

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAdmin: boolean
  login: (response: AuthResponse) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function parseJwt(token: string): { sub: string; email: string; role: string; exp: number } | null {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token)
  if (!payload?.exp) return true
  return Date.now() >= payload.exp * 1000
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
    router.push("/login")
  }, [router])

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      if (isTokenExpired(storedToken)) {
        logout()
      } else {
        setToken(storedToken)
        try {
          setUser(JSON.parse(storedUser))
        } catch {
          logout()
        }
      }
    }
    setIsLoading(false)
  }, [logout])

  const login = useCallback((response: AuthResponse) => {
    localStorage.setItem("token", response.token)
    console.log('parsedJWT: ', parseJwt(response.token))
    const parsedJwt = parseJwt(response.token);
    const user = {
      role: parsedJwt['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
      email: parsedJwt['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      id: parsedJwt['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
    }
    console.log('user', user)

    localStorage.setItem("user", JSON.stringify(user))
    setToken(response.token)
    setUser(user)
  }, [])

  const isAdmin = user?.role === "Admin"

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
