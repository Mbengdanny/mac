import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type Toast = { message: string; id: number }
type ToastCtx = { show: (m: string) => void }

const Ctx = createContext<ToastCtx | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string) => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { message, id }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800)
  }, [])

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="toast-wrap">
        {toasts.map(t => <div key={t.id} className="toast">{t.message}</div>)}
      </div>
    </Ctx.Provider>
  )
}

export function useToast() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useToast must be used within ToastProvider')
  return c
}
