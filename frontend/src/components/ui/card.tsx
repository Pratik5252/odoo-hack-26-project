import { cn } from "../../lib/utils";
import { type HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export function Card({ title, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900",
        className,
      )}
      {...props}
    >
      {title ? <h2 className="mb-5 text-2xl font-semibold text-slate-900 dark:text-white">{title}</h2> : null}
      {children}
    </div>
  );
}
