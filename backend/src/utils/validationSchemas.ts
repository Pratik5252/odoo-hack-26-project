import { z } from "zod";

/**
 * Signup validation schema
 * Creates a new user (ADMIN) and a company
 */
export const SignupSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .trim()
    .optional(),
  country: z
    .string()
    .min(2, "Country must be specified")
    .max(100, "Country name too long")
    .trim(),
  baseCurrency: z
    .string()
    .toUpperCase(),
  currencySymbol: z
    .string()
    .min(1, "Currency symbol required")
    .max(5, "Currency symbol too long")
    .trim(),
});

export type SignupInput = z.infer<typeof SignupSchema>;

/**
 * Login validation schema
 */
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

/**
 * Refresh token validation schema
 */
export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;

/**
 * Logout validation schema (for consistency, though minimal)
 */
export const LogoutSchema = z.object({});

export type LogoutInput = z.infer<typeof LogoutSchema>;
