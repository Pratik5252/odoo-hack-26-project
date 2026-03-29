import type { ExpenseItem } from "../data/mockExpenses";
import { Badge } from "../../../components/ui/badge";

interface ExpenseTableProps {
  expenses: ExpenseItem[];
}

export function ExpenseTable({ expenses }: ExpenseTableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <table className="min-w-full table-auto text-left text-sm font-normal text-slate-700 dark:text-slate-200 w-full">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider dark:border-slate-700 dark:bg-slate-800">
          <tr>
            <th className="px-4 py-3">Employee</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Paid By</th>
            <th className="px-4 py-3">Remarks</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} className="border-b border-slate-200 dark:border-slate-800">
              <td className="px-4 py-3">{expense.employee}</td>
              <td className="px-4 py-3">{expense.description}</td>
              <td className="px-4 py-3">{expense.date}</td>
              <td className="px-4 py-3">{expense.category}</td>
              <td className="px-4 py-3">{expense.paidBy}</td>
              <td className="px-4 py-3">{expense.remarks}</td>
              <td className="px-4 py-3">{expense.amount.toLocaleString()} {expense.currency}</td>
              <td className="px-4 py-3"><Badge status={expense.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
