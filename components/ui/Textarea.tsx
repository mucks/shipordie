import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-black uppercase tracking-wide text-white mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-4 py-3 bg-[#2a2a2a] border-4 border-black font-medium text-white placeholder:text-gray-400 focus:outline-none focus:bg-[#333333] resize-vertical ${
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

Textarea.displayName = 'Textarea';


