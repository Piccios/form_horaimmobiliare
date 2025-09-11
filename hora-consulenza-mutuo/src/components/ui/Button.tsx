import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
}

export default function Button({ loading, className = '', children, ...props }: Props) {
  return (
    <button {...props} className={`btn ${className}`} disabled={loading || props.disabled}>
      {loading ? 'Invio in corso…' : children}
    </button>
  )
}


