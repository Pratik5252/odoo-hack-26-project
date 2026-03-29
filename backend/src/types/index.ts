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
