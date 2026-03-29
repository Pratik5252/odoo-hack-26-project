export type UserRole = "ADMIN" | "EMPLOYEE" | "MANAGER";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  companyId: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
}
