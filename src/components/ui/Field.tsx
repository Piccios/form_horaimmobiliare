import type { ReactNode, ReactElement } from 'react'
import { isValidElement, cloneElement } from 'react'

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
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  const invalid = Boolean(error)

  const baseInputClass = 'w-full rounded-md border px-3 py-2 shadow-sm placeholder-gray-400 transition focus:outline-none'
  const validRingClass = 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
  const invalidRingClass = 'border-red-600 focus:ring-2 focus:ring-red-500 focus:border-red-500'

  const enhanceChild = (node: ReactNode): ReactNode => {
    if (!isValidElement(node)) return node
    const el = node as ReactElement<{ className?: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }>

    // Only enhance common form controls
    const tag = (el.type as any)?.toString?.() || ''
    const isFormControl = ['input', 'select', 'textarea'].includes((el.type as any)) || /input|select|textarea/i.test(tag)
    if (!isFormControl) return node

    const mergedClassName = [
      baseInputClass,
      invalid ? invalidRingClass : validRingClass,
      el.props.className || ''
    ].filter(Boolean).join(' ')

    return cloneElement(el, {
      className: mergedClassName,
      'aria-invalid': invalid || el.props['aria-invalid'],
      'aria-describedby': describedBy || el.props['aria-describedby']
    })
  }

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-900">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <div aria-describedby={describedBy}>
        {enhanceChild(children)}
      </div>
      {hint && <p id={hintId} className="text-xs text-gray-600">{hint}</p>}
      {error && <p id={errorId} className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

/*
CLAUDE_TODO: Confermare che l'associazione aria-describedby gestisca più messaggi e che l'ordine sia corretto.
*/

