export interface ToastMessage {
  id: number
  variant: 'success' | 'error'
  message: string
}

type Listener = () => void

let toasts: ToastMessage[] = []
let nextId = 0
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((listener) => listener())
}

function dismiss(id: number) {
  toasts = toasts.filter((toast) => toast.id !== id)
  emit()
}

function push(variant: ToastMessage['variant'], message: string) {
  const id = nextId++
  toasts = [...toasts, { id, variant, message }]
  emit()
  setTimeout(() => dismiss(id), 5000)
}

export const toast = {
  success: (message: string) => push('success', message),
  error: (message: string) => push('error', message),
}

export function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot() {
  return toasts
}

export { dismiss }
