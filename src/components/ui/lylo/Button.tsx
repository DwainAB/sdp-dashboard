import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
  secondary: 'bg-white hover:bg-gray-200 text-gray-700 border border-gray-300',
  danger: 'bg-red-700 hover:bg-red-600 text-white',
  ghost: 'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
}

export function Button({ className = '', variant = 'secondary', type, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type ?? 'button'}
      {...props}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLASS[variant],
        className,
      ].join(' ')}
    />
  )
}
