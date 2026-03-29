import { getApiBaseUrl } from "../../../lib/apiBase";

export interface ManagerOption {
  id: string;
  name: string | null;
  email: string;
}

export interface TeamUser {
  id: string;
  email: string;
  name: string | null;
  role: "EMPLOYEE" | "MANAGER" | "ADMIN";
  managerId: string | null;
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string; message?: string };
    if (typeof data.error === "string" && data.error) return data.error;
    if (typeof data.message === "string" && data.message) return data.message;
  } catch {
    /* ignore */
  }
  return `Request failed (${res.status})`;
}

export async function fetchManagers(accessToken: string): Promise<ManagerOption[]> {
  const res = await fetch(`${getApiBaseUrl()}/users/managers`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = (await res.json()) as { success?: boolean; data?: ManagerOption[]; error?: string; message?: string };

  if (!res.ok || data.success === false) {
    throw new Error(data.error || data.message || `Request failed (${res.status})`);
  }

  return data.data ?? [];
}

/** Employees + managers for the admin table (same company scope as the logged-in admin). */
export async function fetchTeamUsers(accessToken: string): Promise<TeamUser[]> {
  const res = await fetch(`${getApiBaseUrl()}/users/team`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = (await res.json()) as { success?: boolean; data?: TeamUser[]; error?: string; message?: string };

  if (!res.ok || data.success === false) {
    throw new Error(data.error || data.message || `Request failed (${res.status})`);
  }

  return data.data ?? [];
}

export interface CreateTeamUserPayload {
  email: string;
  name: string;
  password: string;
  role: "EMPLOYEE" | "MANAGER";
  managerId: string | null;
}

export async function createTeamUser(
  accessToken: string,
  payload: CreateTeamUserPayload
): Promise<TeamUser> {
  const body: Record<string, unknown> = {
    email: payload.email.trim().toLowerCase(),
    name: payload.name.trim(),
    password: payload.password,
    role: payload.role,
  };
  if (payload.role === "EMPLOYEE") {
    body.managerId = payload.managerId;
  }

  const res = await fetch(`${getApiBaseUrl()}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as {
    success?: boolean;
    data?: TeamUser;
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

export async function sendUserPassword(email: string): Promise<void> {
  const url = `${getApiBaseUrl()}/api/admin/users/send-password`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim() }),
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
}
