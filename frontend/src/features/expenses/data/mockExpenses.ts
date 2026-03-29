export type ExpenseStatus = "Draft" | "Submitted" | "Approved" | "Rejected";

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
  status: ExpenseStatus;
}

export const mockExpenses: ExpenseItem[] = [
  {
    id: "1",
    employee: "Sarah",
    description: "Restaurant lunch with client",
    date: "2025-10-04",
    category: "Food",
    paidBy: "Sarah",
    remarks: "Office lunch",
    amount: 5000,
    currency: "INR",
    status: "Draft",
  },
  {
    id: "2",
    employee: "Mohan",
    description: "Uber ride to airport",
    date: "2025-10-02",
    category: "Travel",
    paidBy: "Mohan",
    remarks: "Airport pickup",
    amount: 1200,
    currency: "INR",
    status: "Submitted",
  },
  {
    id: "3",
    employee: "Aisha",
    description: "Client gift box",
    date: "2025-10-01",
    category: "Gifts",
    paidBy: "Aisha",
    remarks: "Quarterly sales gift",
    amount: 2000,
    currency: "INR",
    status: "Approved",
  },
];
