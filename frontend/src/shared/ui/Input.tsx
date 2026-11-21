import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null | ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const errorMsg = error ? String(error) : null;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={`w-full px-3 py-2 bg-white dark:bg-slate-950 border ${
            errorMsg ? "border-red-500 focus:ring-red-500" : "border-slate-300 dark:border-slate-700 focus:ring-blue-500"
          } rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${className}`}
          {...props}
        />
        {errorMsg && <p className="mt-1 text-xs text-red-500">{errorMsg}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";