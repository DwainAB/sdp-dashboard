import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, className = '', ...props }, ref) => (
  <div>
    {label && <label className="text-xs text-gray-500 mb-1.5 block">{label}</label>}
    <input
      ref={ref}
      className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none placeholder-gray-400 focus:border-indigo-500 transition-colors ${className}`}
      {...props}
    />
  </div>
))
Input.displayName = 'Input'
