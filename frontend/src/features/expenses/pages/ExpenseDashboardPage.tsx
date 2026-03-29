import { useEffect, useMemo, useState, useRef } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { LogoutButton } from "../../../components/layout/LogoutButton";
import { Dialog } from "../../../components/ui/dialog";
import { ExpenseTable } from "../components/ExpenseTable";
import { ExpenseForm } from "../components/ExpenseForm";
import { useAuth } from "../../auth/context/AuthContext";
import { fetchMyExpenses, type DbExpense } from "../services/expenseApi";

export type ExpenseStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";

export interface ExpenseItem {
  id: string;
  employee: string;
  description: string;
  date: string;
  category: string;
  paidBy: string;
  remarks: string;
  amount: number;
  currency: string;
  status: "Draft" | "Submitted" | "Approved" | "Rejected";
}

// Map database status to frontend status
function mapStatus(dbStatus: ExpenseStatus): "Draft" | "Submitted" | "Approved" | "Rejected" {
  const statusMap: Record<ExpenseStatus, "Draft" | "Submitted" | "Approved" | "Rejected"> = {
    DRAFT: "Draft",
    PENDING: "Submitted",
    APPROVED: "Approved",
    REJECTED: "Rejected",
  };
  return statusMap[dbStatus];
}

// Convert DbExpense to ExpenseItem
function dbExpenseToExpenseItem(dbExpense: DbExpense): ExpenseItem {
  return {
    id: dbExpense.id,
    employee: dbExpense.user.name || dbExpense.user.email,
    description: dbExpense.description || "No description",
    date: new Date(dbExpense.createdAt).toISOString().split("T")[0],
    category: dbExpense.category,
    paidBy: dbExpense.user.name || dbExpense.user.email,
    remarks: dbExpense.description || "",
    amount: dbExpense.amount,
    currency: "INR",
    status: mapStatus(dbExpense.status),
  };
}

const initialSummary = (expenses: ExpenseItem[]) => {
  const summary = { Draft: 0, Submitted: 0, Approved: 0, Rejected: 0 };
  expenses.forEach((expense) => {
    summary[expense.status] += expense.amount;
  });
  return summary;
};

export function ExpenseDashboardPage() {
  const { accessToken } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch expenses on mount
  useEffect(() => {
    if (!accessToken) {
      console.log("[ExpenseDashboard] No access token yet");
      setLoading(false);
      return;
    }

    const loadExpenses = async () => {
      try {
        console.log("[ExpenseDashboard] Starting to load expenses...");
        setLoading(true);
        const dbExpenses = await fetchMyExpenses(accessToken);
        console.log("[ExpenseDashboard] Successfully fetched expenses:", dbExpenses);
        const mappedExpenses = dbExpenses.map(dbExpenseToExpenseItem);
        setExpenses(mappedExpenses);
      } catch (err) {
        // Still allow form to work even if fetch fails
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error("[ExpenseDashboard] Failed to load expenses:", errorMsg);
        setExpenses([]);
        // Don't set error - let user create new expenses anyway
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, [accessToken]);

  const summary = useMemo(() => initialSummary(expenses), [expenses]);

  const addExpense = (expense: ExpenseItem) => {
    setExpenses((prev) => [expense, ...prev]);
    setShowFormDialog(false);
  };

  const closeFormDialog = () => setShowFormDialog(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      alert(`File uploaded: ${file.name}\nNote: File processing will be implemented in the backend.`);
      // Reset the input
      event.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 sm:p-6">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* Header */}
        <Card className="max-w-none bg-white/95 backdrop-blur dark:bg-slate-900/95">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">My Expenses</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Create, track, and manage your expense reports.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Expense Dashboard
              </span>
              <LogoutButton />
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="max-w-none">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-indigo-600 dark:border-slate-600 dark:border-t-indigo-400"></div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Loading your expenses...</p>
            </div>
          </Card>
        )}

        {/* Summary Cards & Form - always show */}
        {!loading && (
          <>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="max-w-none">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">To Submit</p>
                  <p className="text-xl font-semibold text-slate-900 dark:text-white">₹ {summary.Draft.toLocaleString()}</p>
                  <div className="h-1 w-8 bg-blue-400 rounded-full"></div>
                </div>
              </Card>
              <Card className="max-w-none">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Waiting Approval</p>
                  <p className="text-xl font-semibold text-slate-900 dark:text-white">₹ {summary.Submitted.toLocaleString()}</p>
                  <div className="h-1 w-8 bg-amber-400 rounded-full"></div>
                </div>
              </Card>
              <Card className="max-w-none">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Approved</p>
                  <p className="text-xl font-semibold text-slate-900 dark:text-white">₹ {summary.Approved.toLocaleString()}</p>
                  <div className="h-1 w-8 bg-green-400 rounded-full"></div>
                </div>
              </Card>
              <Card className="max-w-none">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Rejected</p>
                  <p className="text-xl font-semibold text-slate-900 dark:text-white">₹ {summary.Rejected.toLocaleString()}</p>
                  <div className="h-1 w-8 bg-red-400 rounded-full"></div>
                </div>
              </Card>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  onClick={handleUploadClick}
                  className="!w-auto h-6 rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-medium text-white shadow-none hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                >
                  Upload
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => setShowFormDialog(true)}
                  className="!w-auto h-6 rounded-md px-2 py-0.5 text-[10px] font-medium shadow-none"
                >
                  + New Expense
                </Button>
              </div>
              <Card title="Expense List" className="max-w-none">
                {expenses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No expenses yet</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">Click "+ New Expense" above to add your first expense.</p>
                  </div>
                ) : (
                  <ExpenseTable expenses={expenses} />
                )}
              </Card>
            </div>
          </>
        )}

        {/* New Expense Dialog */}
        <Dialog
          isOpen={showFormDialog}
          onClose={closeFormDialog}
          title="New Expense"
        >
          <ExpenseForm onSave={addExpense} onCancel={closeFormDialog} />
        </Dialog>
      </div>
    </div>
  );
}
