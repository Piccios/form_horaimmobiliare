import type { ReactNode } from 'react'

type Props = {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
  required?: boolean
}

export default function Field({ id, label, hint, error, children, required }: Props) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-900">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <div aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}>
        {children}
      </div>
      {hint && <p id={hintId} className="text-xs text-gray-600">{hint}</p>}
      {error && <p id={errorId} className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

/*
CLAUDE_TODO: Confermare che l'associazione aria-describedby gestisca più messaggi e che l'ordine sia corretto.
*/

