import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { ExpenseTable } from "../components/ExpenseTable";
import { ExpenseForm } from "../components/ExpenseForm";
import { mockExpenses } from "../data/mockExpenses";
import type { ExpenseItem } from "../data/mockExpenses";

const initialSummary = (expenses: ExpenseItem[]) => {
  const summary = { Draft: 0, Submitted: 0, Approved: 0, Rejected: 0 };
  expenses.forEach((expense) => {
    summary[expense.status] += expense.amount;
  });
  return summary;
};

export function ExpenseDashboardPage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(mockExpenses);
  const navigate = useNavigate();
  const location = useLocation();
  const isNewExpense = location.pathname.endsWith("/new");

  const summary = useMemo(() => initialSummary(expenses), [expenses]);

  const addExpense = (expense: ExpenseItem) => {
    setExpenses((prev) => [expense, ...prev]);
    navigate("/expenses");
  };

  const backToList = () => navigate("/expenses");

  return (
    <div className="min-h-screen bg-slate-100 p-6 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button onClick={() => {}} className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Upload</Button>
              <Button onClick={() => navigate("/expenses/new")} className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">New</Button>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Logged in as admin</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl bg-slate-50 p-3 text-sm font-medium dark:bg-slate-800">
              To Submit: <span className="font-bold">{summary.Draft.toLocaleString()} INR</span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-sm font-medium dark:bg-slate-800">
              Waiting Approval: <span className="font-bold">{summary.Submitted.toLocaleString()} INR</span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-sm font-medium dark:bg-slate-800">
              Approved: <span className="font-bold">{summary.Approved.toLocaleString()} INR</span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-sm font-medium dark:bg-slate-800">
              Rejected: <span className="font-bold">{summary.Rejected.toLocaleString()} INR</span>
            </div>
          </div>
        </div>

        {isNewExpense ? (
          <ExpenseForm onSave={addExpense} onCancel={backToList} />
        ) : (
          <Card title="Expense List">
            <ExpenseTable expenses={expenses} />
          </Card>
        )}
      </div>
    </div>
  );
}
