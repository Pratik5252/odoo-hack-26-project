import { prisma } from "../../lib/prisma";
import { hashPassword, comparePassword } from "../../utils/password";
import { generateTokens } from "../../utils/token";
import { AppError, Errors } from "../../utils/errorHandler";
import { SignupInput, LoginInput } from "../../utils/validationSchemas";

/**
 * Response type for auth operations
 */
export interface AuthResponse {
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
}

/**
 * Auth Service
 */
export const authService = {
  /**
   * Sign up - creates new User (ADMIN role) and Company
   */
  async signup(input: SignupInput): Promise<AuthResponse> {
    const { email, password, name, country, baseCurrency, currencySymbol } =
      input;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw Errors.Conflict("Email is already registered");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    try {
      // Create company and user in a transaction
      const result = await prisma.$transaction(async (tx: any) => {
        // Create company
        const company = await tx.company.create({
          data: {
            name: `${name || "User"}'s Company`,
            country,
            baseCurrency,
            currencySymbol,
          },
        });

        // Create user with ADMIN role linked to company
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            name: name || email.split("@")[0],
            role: "ADMIN", // Default to ADMIN for signup
            companyId: company.id,
          },
        });

        return { user, company };
      });

      const { user } = result;

      // Generate tokens
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
        },
        tokens,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw Errors.InternalServer("Failed to create user account");
    }
  },

  /**
   * Login - verify credentials and return tokens
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw Errors.Unauthorized("Invalid email or password");
    }

    // Verify password
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      throw Errors.Unauthorized("Invalid email or password");
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      },
      tokens,
    };
  },

  /**
   * Refresh token - generate new access token from refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Import here to avoid circular dependency
      const { verifyRefreshToken } = await import("../../utils/token");

      const decoded = verifyRefreshToken(refreshToken);

      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw Errors.Unauthorized("User not found");
      }

      // Generate new access token
      const { generateAccessToken } = await import("../../utils/token");
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return { accessToken };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw Errors.Unauthorized("Invalid refresh token");
    }
  },

  /**
   * Logout - currently a no-op, can be extended with token blacklisting
   */
  async logout(userId: string): Promise<{ message: string }> {
    // TODO: Implement token blacklisting with Redis or database
    // For now, logout is handled on client-side (token deletion)

    return {
      message: "Logged out successfully",
    };
  },
};
