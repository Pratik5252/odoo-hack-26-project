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
    <Card className="max-w-none border-0 bg-transparent shadow-none">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="employee">
            Employee <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="employee"
            placeholder="Enter employee name"
            value={formState.employee}
            onChange={(e) => setFormState((p) => ({ ...p, employee: e.target.value }))}
            error={errors.employee}
          />
        </div>

        <div>
          <Label htmlFor="description">
            Description <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="description"
            placeholder="What was this expense for?"
            value={formState.description}
            onChange={(e) => setFormState((p) => ({ ...p, description: e.target.value }))}
            error={errors.description}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="category">
              Category <span className="text-rose-500">*</span>
            </Label>
            <Select id="category" value={formState.category} onChange={(e) => setFormState((p) => ({ ...p, category: e.target.value }))}>
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
            {errors.category ? <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.category}</p> : null}
          </div>

          <div>
            <Label htmlFor="date">
              Expense Date <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={formState.date}
              onChange={(e) => setFormState((p) => ({ ...p, date: e.target.value }))}
              error={errors.date}
            />
          </div>

          <div>
            <Label htmlFor="paidBy">
              Paid By <span className="text-rose-500">*</span>
            </Label>
            <Select id="paidBy" value={formState.paidBy} onChange={(e) => setFormState((p) => ({ ...p, paidBy: e.target.value }))}>
              <option value="">Select name</option>
              {paidByList.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
            {errors.paidBy ? <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.paidBy}</p> : null}
          </div>

          <div>
            <Label htmlFor="total">
              Total Amount <span className="text-rose-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="total"
                type="number"
                min={0}
                placeholder="0"
                value={formState.amount}
                onChange={(e) => setFormState((p) => ({ ...p, amount: e.target.value }))}
                error={errors.amount}
              />
              <Select id="currency" value={formState.currency} onChange={(e) => setFormState((p) => ({ ...p, currency: e.target.value }))}>
                {currencies.map((cur) => (<option key={cur} value={cur}>{cur}</option>))}
              </Select>
            </div>
            {errors.amount ? <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.amount}</p> : null}
          </div>
        </div>

        <div>
          <Label htmlFor="remarks">Remarks</Label>
          <Input
            id="remarks"
            placeholder="Any additional notes (optional)"
            value={formState.remarks}
            onChange={(e) => setFormState((p) => ({ ...p, remarks: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="receipt">Receipt Upload</Label>
          <input
            id="receipt"
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setFormState((p) => ({ ...p, receipt: e.target.files ? e.target.files[0] : null }))}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 file:mr-3 file:rounded file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:file:bg-indigo-900/20 dark:file:text-indigo-200"
          />
          {formState.receipt ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">File: {formState.receipt.name}</p> : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
          <button
            type="button"
            onClick={onCancel}
            className="!w-auto rounded px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Close form"
          >
            ✕
          </button>
          <Button type="submit" className="!w-auto h-8 px-3 py-1 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 shadow-none" isLoading={isSubmitting}>
            Submit
          </Button>
        </div>
      </form>
    </Card>
  );
}
