"use client"

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

interface RetroModeContextType {
  isRetro: boolean
  toggleRetro: () => void
}

const RetroModeContext = createContext<RetroModeContextType>({
  isRetro: false,
  toggleRetro: () => {},
})

const STORAGE_KEY = 'b2bmax-retro-mode'

export function RetroModeProvider({ children }: { children: React.ReactNode }) {
  const [isRetro, setIsRetro] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') {
      setIsRetro(true)
    }
  }, [])

  useEffect(() => {
    if (!isMounted) return
    if (isRetro) {
      document.body.classList.add('retro-mode')
      document.body.classList.add('retro-powering-on')
      const timer = setTimeout(() => {
        document.body.classList.remove('retro-powering-on')
      }, 500)
      return () => clearTimeout(timer)
    } else {
      document.body.classList.remove('retro-mode')
      document.body.classList.remove('retro-powering-on')
    }
    localStorage.setItem(STORAGE_KEY, String(isRetro))
  }, [isRetro, isMounted])

  const toggleRetro = useCallback(() => {
    setIsRetro((prev) => !prev)
  }, [])

  return (
    <RetroModeContext.Provider value={{ isRetro, toggleRetro }}>
      {children}
    </RetroModeContext.Provider>
  )
}

export function useRetroMode() {
  return useContext(RetroModeContext)
}
