import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-black uppercase tracking-wide text-white mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-3 bg-[#2a2a2a] border-4 border-black font-medium text-white placeholder:text-gray-400 focus:outline-none focus:bg-[#333333] ${
            error ? 'border-red-500 bg-red-900/20' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm font-bold text-red-400 uppercase">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';


