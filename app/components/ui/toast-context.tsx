"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { Toast, ToastProvider, ToastViewport } from "./toast"
import { ToastTitle, ToastDescription, ToastClose } from "./toast"

type ToastType = {
  id: string
  title: string
  description?: string
  variant?: "default" | "destructive" | "success"
}

type ToastContextType = {
  toasts: ToastType[]
  addToast: (toast: Omit<ToastType, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastContainer({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([])

  const addToast = (toast: Omit<ToastType, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      <ToastProvider>
        {children}
        {toasts.map((toast) => (
          <Toast key={toast.id} variant={toast.variant}>
            <div className="grid gap-1">
              <ToastTitle>{toast.title}</ToastTitle>
              {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
            </div>
            <ToastClose onClick={() => removeToast(toast.id)} />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastContainer")
  }
  return context
}

