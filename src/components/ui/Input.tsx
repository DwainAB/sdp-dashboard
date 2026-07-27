import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, className = '', ...props }, ref) => (
  <div>
    {label && <label className="text-xs text-gray-400 mb-1.5 block">{label}</label>}
    <input
      ref={ref}
      className={`w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none placeholder-gray-600 focus:border-indigo-500 transition-colors ${className}`}
      {...props}
    />
  </div>
))
Input.displayName = 'Input'
