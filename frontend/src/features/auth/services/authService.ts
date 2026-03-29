import { getApiBaseUrl } from "../../../lib/apiBase";
import type { AuthSession, AuthUser, UserRole } from "../types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  name?: string;
  country: string;
  baseCurrency: string;
  currencySymbol: string;
}

interface ApiSuccess<T> {
  success: true;
  data: T;
  message: string;
}

interface ApiErrorBody {
  success: false;
  message?: string;
  errors?: Record<string, string[]>;
}

type ApiEnvelope<T> = ApiSuccess<T> | ApiErrorBody;

function parseApiError(json: unknown): string {
  if (typeof json !== "object" || json === null) return "Request failed";
  const o = json as Record<string, unknown>;
  if (typeof o.message === "string" && o.message) return o.message;
  const errs = o.errors;
  if (errs && typeof errs === "object") {
    const first = Object.values(errs as Record<string, string[]>).flat()[0];
    if (typeof first === "string") return first;
  }
  return "Request failed";
}

function mapUser(raw: {
  id: string;
  email: string;
  name: string | null;
  role: string;
  companyId: string | null;
}): AuthUser {
  return {
    id: raw.id,
    email: raw.email,
    name: raw.name,
    role: raw.role as UserRole,
    companyId: raw.companyId,
  };
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as ApiEnvelope<T>;

  if (!res.ok || json.success === false) {
    throw new Error(parseApiError(json));
  }

  const data = json.data;
  if (data === undefined || data === null) {
    throw new Error("Invalid response from server");
  }
  return data;
}

export async function loginRequest(creds: LoginCredentials): Promise<AuthSession> {
  const data = await postJson<{
    user: {
      id: string;
      email: string;
      name: string | null;
      role: string;
      companyId: string | null;
    };
    tokens: { accessToken: string; refreshToken: string };
  }>("/auth/login", {
    email: creds.email.trim().toLowerCase(),
    password: creds.password,
  });

  return {
    user: mapUser(data.user),
    tokens: data.tokens,
  };
}

export async function signupRequest(payload: SignupPayload): Promise<AuthSession> {
  const data = await postJson<{
    user: {
      id: string;
      email: string;
      name: string | null;
      role: string;
      companyId: string | null;
    };
    tokens: { accessToken: string; refreshToken: string };
  }>("/auth/signup", {
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    name: payload.name?.trim(),
    country: payload.country.trim(),
    baseCurrency: payload.baseCurrency.trim().toUpperCase(),
    currencySymbol: payload.currencySymbol.trim(),
  });

  return {
    user: mapUser(data.user),
    tokens: data.tokens,
  };
}

export async function logoutRequest(accessToken: string): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const json = (await res.json()) as ApiErrorBody;
    throw new Error(parseApiError(json));
  }
}
