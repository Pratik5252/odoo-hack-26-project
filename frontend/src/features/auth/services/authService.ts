const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface AuthPayload {
  name?: string;
  email: string;
  password: string;
  country?: string;
  baseCurrency?: string;
  currencySymbol?: string;
}

export type AuthResponse = {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    companyId: string | null;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

async function callApi<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let json: ApiResponse<T> | null = null;

  try {
    json = await response.json();
  } catch {
    throw new Error("Unexpected server response");
  }

  if (!response.ok || !json?.success) {
    throw new Error(json?.message || response.statusText || "Authentication failed");
  }

  return json.data;
}

export async function login({ email, password }: AuthPayload): Promise<AuthResponse> {
  const payload = { email, password };
  return await callApi<AuthResponse>(`${API_BASE_URL}/auth/login`, payload);
}

export async function signup({ name, email, password, country, baseCurrency, currencySymbol }: AuthPayload): Promise<AuthResponse> {
  const payload = { name, email, password, country, baseCurrency, currencySymbol };
  return await callApi<AuthResponse>(`${API_BASE_URL}/auth/signup`, payload);
}
