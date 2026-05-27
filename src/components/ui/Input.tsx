'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?:  React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword  = type === 'password';
    const inputType   = isPassword && showPassword ? 'text' : type;

    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
        <div className="relative flex items-center">
          {icon && <span className="absolute left-3.5 text-gray-400">{icon}</span>}
          <input
            ref={ref}
            type={inputType}
            className={clsx(
              'w-full rounded-2xl border bg-white py-3 text-gray-900 placeholder-gray-400 text-base',
              'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent',
              'transition-all duration-200',
              error ? 'border-red-400 focus:ring-red-400' : 'border-gray-200',
              icon ? 'pl-11 pr-4' : 'px-4',
              isPassword && 'pr-12',
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
