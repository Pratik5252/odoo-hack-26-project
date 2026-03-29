import { getApiBaseUrl } from "../../../lib/apiBase";

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;
  description: string | null;
  receiptUrl: string | null;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  approvals: Array<{
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
  }>;
}

/**
 * Fetch team expenses for the authenticated manager
 */
export async function fetchTeamExpenses(accessToken: string): Promise<Expense[]> {
  const res = await fetch(`${getApiBaseUrl()}/managers/team/expenses/all`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = (await res.json()) as {
    success?: boolean;
    data?: Expense[];
    error?: string;
    message?: string;
  };

  if (!res.ok || data.success === false) {
    throw new Error(data.error || data.message || `Request failed (${res.status})`);
  }

  return data.data ?? [];
}

/**
 * Update expense status (for approval/rejection)
 */
export async function updateExpenseStatus(
  accessToken: string,
  expenseId: string,
  status: "APPROVED" | "REJECTED"
): Promise<Expense> {
  const res = await fetch(`${getApiBaseUrl()}/expenses/${expenseId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ status }),
  });

  const data = (await res.json()) as {
    success?: boolean;
    data?: Expense;
    error?: string;
    message?: string;
  };

  if (!res.ok || data.success === false) {
    throw new Error(data.error || data.message || `Request failed (${res.status})`);
  }

  if (!data.data) {
    throw new Error("Invalid response from server");
  }

  return data.data;
}
