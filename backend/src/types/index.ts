// Employee Types
export interface Employee {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface EmployeeResponse {
  success: boolean;
  data?: Employee | Employee[];
  error?: string;
  message?: string;
}

// Manager Types
export interface Manager {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
}

export interface ManagerResponse {
  success: boolean;
  data?: Manager | Manager[];
  error?: string;
  message?: string;
}

// Team Types
export interface Team {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
}

// Expense Types
export interface Expense {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  amount: number;
  category: string;
  description?: string | null;
  receiptUrl?: string | null;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseResponse {
  success: boolean;
  data?: Expense | Expense[];
  error?: string;
  message?: string;
}
