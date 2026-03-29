import { cn } from "../../lib/utils";
import type { HTMLAttributes } from "react";

const colors = {
  Draft: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
  Submitted: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  Approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
  Rejected: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: "Draft" | "Submitted" | "Approved" | "Rejected";
}

export function Badge({ status, className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        colors[status],
        className,
      )}
      {...props}
    >
      {status}
    </span>
  );
}
