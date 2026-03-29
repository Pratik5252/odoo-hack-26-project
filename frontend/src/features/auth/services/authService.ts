export interface AuthPayload {
  name?: string;
  email: string;
  password: string;
  country?: string;
}

export async function login({ email, password, country }: AuthPayload) {
  await new Promise((resolve) => setTimeout(resolve, 700));

  if (!email.includes("@") || password.length < 6) {
    throw new Error("Invalid email or password.");
  }

  return {
    token: "dummy-jwt-token",
    user: { email, role: "admin", country: country ?? "Unknown" },
  };
}

export async function signup({ name, email, password, country }: AuthPayload) {
  await new Promise((resolve) => setTimeout(resolve, 700));

  if (!name || name.length < 2) {
    throw new Error("Name must be at least 2 characters.");
  }

  if (!email.includes("@") || password.length < 6) {
    throw new Error("Invalid email or password.");
  }

  return {
    token: "dummy-jwt-token",
    user: { name, email, role: "admin", country: country ?? "Unknown" },
  };
}
