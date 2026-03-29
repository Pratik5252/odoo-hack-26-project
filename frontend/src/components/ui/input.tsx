import { cn } from "../../lib/utils";
import type { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({ className, error, ...props }: InputProps) {
  return (
    <div className="w-full">
      <input
        className={cn(
          "w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500",
          error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-200" : "",
          className,
        )}
        {...props}
      />
      {error ? <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p> : null}
    </div>
  );
}
