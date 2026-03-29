import { getApiBaseUrl } from "../../../lib/apiBase";

export interface ExpenseApproval {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  // other fields
}

export interface ExpenseUser {
  id: string;
  name: string | null;
  email: string;
}

export interface DbExpense {
  id: string;
  userId: string;
  user: ExpenseUser;
  amount: number;
  category: string;
  description: string | null;
  receiptUrl: string | null;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  approvals: ExpenseApproval[];
}

export interface CreateExpenseInput {
  userId: string;
  amount: number;
  category: string;
  description?: string;
  receiptUrl?: string;
}

export interface UpdateExpenseInput {
  amount?: number;
  category?: string;
  description?: string;
  receiptUrl?: string;
  status?: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
}

/**
 * Fetch all expenses for the current user
 */
export async function fetchMyExpenses(accessToken: string): Promise<DbExpense[]> {
  const url = `${getApiBaseUrl()}/expenses/me`;
  console.log(`[ExpenseApi] Fetching from: ${url}`);
  
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  console.log(`[ExpenseApi] Response status: ${res.status}`);
  
  if (!res.ok) {
    const error = await res.json();
    console.error(`[ExpenseApi] Error response:`, error);
    throw new Error(error.error || `HTTP ${res.status}: ${error.message}`);
  }

  const data = await res.json();
  console.log(`[ExpenseApi] Fetched ${data.data?.length || 0} expenses`);
  return data.data || [];
}

/**
 * Create a new expense
 */
export async function createExpense(
  accessToken: string,
  input: CreateExpenseInput
): Promise<DbExpense> {
  const res = await fetch(`${getApiBaseUrl()}/expenses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create expense");
  }

  const data = await res.json();
  return data.data;
}

/**
 * Update an expense
 */
export async function updateExpense(
  accessToken: string,
  expenseId: string,
  input: UpdateExpenseInput
): Promise<DbExpense> {
  const res = await fetch(`${getApiBaseUrl()}/expenses/${expenseId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update expense");
  }

  const data = await res.json();
  return data.data;
}

/**
 * Delete an expense
 */
export async function deleteExpense(
  accessToken: string,
  expenseId: string
): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}/expenses/${expenseId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete expense");
  }
}
