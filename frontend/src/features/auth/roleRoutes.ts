import type { UserRole } from "./types";

export function getDefaultRouteForRole(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "EMPLOYEE":
      return "/expenses";
    case "MANAGER":
      return "/approvals";
    default:
      return "/login";
  }
}

export function roleLabel(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "EMPLOYEE":
      return "Employee";
    case "MANAGER":
      return "Manager";
    default:
      return role;
  }
}
