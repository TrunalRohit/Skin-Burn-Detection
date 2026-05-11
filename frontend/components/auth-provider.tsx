"use client"

import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signOut,
  type User,
} from "firebase/auth"
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  firebaseAuth,
  firebaseConfigError,
  isFirebaseConfigured,
} from "@/lib/firebase"

type AuthContextValue = {
  user: User | null
  loading: boolean
  isConfigured: boolean
  configError: string | null
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function writeAuthArtifacts(token: string, user: User) {
  localStorage.setItem("auth-token", token)
  localStorage.setItem(
    "user-info",
    JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    })
  )
  document.cookie = `auth-token=${encodeURIComponent(token)}; path=/; max-age=3600; samesite=lax`
}

function clearAuthArtifacts() {
  localStorage.removeItem("auth-token")
  localStorage.removeItem("user-info")
  document.cookie = "auth-token=; path=/; max-age=0; samesite=lax"
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!firebaseAuth || !isFirebaseConfigured) {
      clearAuthArtifacts()
      setUser(null)
      setLoading(false)
      return
    }

    let active = true

    setPersistence(firebaseAuth, browserLocalPersistence).catch(() => {
      // If persistence setup fails, the auth listener below still keeps state in sync.
    })

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (nextUser) => {
      if (!active) {
        return
      }

      if (nextUser) {
        try {
          const token = await nextUser.getIdToken()
          writeAuthArtifacts(token, nextUser)
          if (!active) {
            return
          }
          setUser(nextUser)
        } catch {
          clearAuthArtifacts()
          if (!active) {
            return
          }
          setUser(null)
        }
      } else {
        clearAuthArtifacts()
        setUser(null)
      }

      setLoading(false)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isConfigured: isFirebaseConfigured,
      configError: firebaseConfigError,
      logout: async () => {
        if (!firebaseAuth) {
          clearAuthArtifacts()
          setUser(null)
          return
        }
        await signOut(firebaseAuth)
      },
    }),
    [loading, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.")
  }
  return context
}
