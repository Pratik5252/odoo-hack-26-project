import type { ExpenseItem } from "../data/mockExpenses";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";

interface ExpenseTableProps {
  expenses: ExpenseItem[];
  onSubmit?: (expenseId: string) => Promise<void>;
  submittingId?: string | null;
}

export function ExpenseTable({ expenses, onSubmit, submittingId }: ExpenseTableProps) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-12 dark:border-slate-700">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">No expenses yet</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Create your first expense to get started</p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400">
              <th className="px-3 py-2 font-medium text-left">Employee</th>
              <th className="px-3 py-2 font-medium text-left">Description</th>
              <th className="px-3 py-2 font-medium text-left">Date</th>
              <th className="px-3 py-2 font-medium text-left">Category</th>
              <th className="px-3 py-2 font-medium text-left">Amount</th>
              <th className="px-3 py-2 font-medium text-left">Status</th>
              <th className="px-3 py-2 font-medium text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-b border-slate-100 align-middle last:border-b-0 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-3 py-2">
                  <span className="text-xs font-medium text-slate-900 dark:text-slate-100">{expense.employee}</span>
                </td>
                <td className="px-3 py-2">
                  <span className="text-xs text-slate-700 dark:text-slate-300">{expense.description}</span>
                </td>
                <td className="px-3 py-2">
                  <span className="text-xs text-slate-600 dark:text-slate-400">{expense.date}</span>
                </td>
                <td className="px-3 py-2">
                  <span className="inline-flex rounded-full bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {expense.category}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className="text-xs font-medium text-slate-900 dark:text-slate-100">
                    {expense.currency} {expense.amount.toLocaleString()}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <Badge status={expense.status} />
                </td>
                <td className="px-3 py-2">
                  {expense.status === "Draft" && onSubmit ? (
                    <Button
                      onClick={() => onSubmit(expense.id)}
                      disabled={submittingId === expense.id}
                      className="h-6 px-2 text-xs"
                    >
                      {submittingId === expense.id ? "Submitting..." : "Submit"}
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-500">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 sm:hidden">
        {expenses.map((expense) => (
          <div key={expense.id} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{expense.employee}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{expense.description}</p>
              </div>
              <Badge status={expense.status} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="font-medium text-slate-500 dark:text-slate-400">Date</p>
                <p className="text-slate-900 dark:text-slate-100">{expense.date}</p>
              </div>
              <div>
                <p className="font-medium text-slate-500 dark:text-slate-400">Category</p>
                <p className="text-slate-900 dark:text-slate-100">{expense.category}</p>
              </div>
              <div className="col-span-2">
                <p className="font-medium text-slate-500 dark:text-slate-400">Amount</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{expense.currency} {expense.amount.toLocaleString()}</p>
              </div>
            </div>
            {expense.status === "Draft" && onSubmit && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <Button
                  onClick={() => onSubmit(expense.id)}
                  disabled={submittingId === expense.id}
                  className="w-full h-8 text-xs"
                >
                  {submittingId === expense.id ? "Submitting..." : "Submit Expense"}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
