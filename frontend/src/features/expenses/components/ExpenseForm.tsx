import type { FormEvent } from "react";
import { useState } from "react";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/button";
import type { ExpenseItem } from "../data/mockExpenses";

interface ExpenseFormProps {
  onSave: (expense: ExpenseItem) => void;
  onCancel: () => void;
}

const categories = ["Food", "Travel", "Office", "Gifts", "Supplies"];
const paidByList = ["Sarah", "Mohan", "Aisha", "Admin"];
const currencies = ["INR", "USD", "EUR", "GBP"];

export function ExpenseForm({ onSave, onCancel }: ExpenseFormProps) {
  const [formState, setFormState] = useState({
    employee: "",
    description: "",
    date: "",
    category: "",
    paidBy: "",
    amount: "",
    currency: "INR",
    remarks: "",
    receipt: null as File | null,
    status: "Draft" as ExpenseItem["status"],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formState.employee.trim()) nextErrors.employee = "Employee is required.";
    if (!formState.description.trim()) nextErrors.description = "Description is required.";
    if (!formState.date) nextErrors.date = "Expense date is required.";
    if (!formState.category) nextErrors.category = "Category is required.";
    if (!formState.paidBy) nextErrors.paidBy = "Paid by is required.";
    if (!formState.amount || Number(formState.amount) <= 0) nextErrors.amount = "Amount must be greater than 0.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newExpense: ExpenseItem = {
      id: `${Date.now()}`,
      employee: formState.employee,
      description: formState.description,
      date: formState.date,
      category: formState.category,
      paidBy: formState.paidBy,
      remarks: formState.remarks,
      amount: Number(formState.amount),
      currency: formState.currency,
      status: formState.status,
    };

    onSave(newExpense);
    setIsSubmitting(false);
  };

  return (
    <Card title="New Expense">
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="rounded-full bg-indigo-100 px-2 py-1 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">Draft</span>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200">Waiting Approval</span>
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">Approved</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div>
          <Label htmlFor="employee">Employee</Label>
          <Input id="employee" value={formState.employee} onChange={(e) => setFormState((p) => ({ ...p, employee: e.target.value }))} error={errors.employee} />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input id="description" value={formState.description} onChange={(e) => setFormState((p) => ({ ...p, description: e.target.value }))} error={errors.description} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select id="category" value={formState.category} onChange={(e) => setFormState((p) => ({ ...p, category: e.target.value }))}>
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
            {errors.category ? <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.category}</p> : null}
          </div>

          <div>
            <Label htmlFor="date">Expense Date</Label>
            <Input id="date" type="date" value={formState.date} onChange={(e) => setFormState((p) => ({ ...p, date: e.target.value }))} error={errors.date} />
          </div>

          <div>
            <Label htmlFor="paidBy">Paid By</Label>
            <Select id="paidBy" value={formState.paidBy} onChange={(e) => setFormState((p) => ({ ...p, paidBy: e.target.value }))}>
              <option value="">Select name</option>
              {paidByList.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
            {errors.paidBy ? <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.paidBy}</p> : null}
          </div>

          <div>
            <Label htmlFor="total">Total Amount</Label>
            <div className="flex gap-2">
              <Input id="total" type="number" min={0} value={formState.amount} onChange={(e) => setFormState((p) => ({ ...p, amount: e.target.value }))} error={errors.amount} />
              <Select id="currency" value={formState.currency} onChange={(e) => setFormState((p) => ({ ...p, currency: e.target.value }))}>
                {currencies.map((cur) => (<option key={cur} value={cur}>{cur}</option>))}
              </Select>
            </div>
            {errors.amount ? <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.amount}</p> : null}
          </div>
        </div>

        <div>
          <Label htmlFor="remarks">Remarks</Label>
          <Input id="remarks" value={formState.remarks} onChange={(e) => setFormState((p) => ({ ...p, remarks: e.target.value }))} />
        </div>

        <div>
          <Label htmlFor="receipt">Receipt Upload</Label>
          <input
            id="receipt"
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setFormState((p) => ({ ...p, receipt: e.target.files ? e.target.files[0] : null }))}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          {formState.receipt ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">File: {formState.receipt.name}</p> : null}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            Back
          </button>
          <Button type="submit" isLoading={isSubmitting}>Submit</Button>
        </div>
      </form>
    </Card>
  );
}
