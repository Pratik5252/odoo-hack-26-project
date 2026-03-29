import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import {
  SignupSchema,
  LoginSchema,
  RefreshTokenSchema,
} from "../../utils/validationSchemas";
import { AppError } from "../../utils/errorHandler";

/**
 * Standard success response format
 */
interface SuccessResponse<T> {
  success: true;
  data: T;
  message: string;
}

/**
 * Auth Controller
 */
export const authController = {
  /**
   * POST /auth/signup
   * Create new user account (ADMIN) with company
   */
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const validatedData = SignupSchema.parse(req.body);

      // Call service
      const result = await authService.signup(validatedData);

      // Return success response
      const response: SuccessResponse<typeof result> = {
        success: true,
        data: result,
        message: "Account created successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /auth/login
   * Authenticate user and return tokens
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const validatedData = LoginSchema.parse(req.body);

      // Call service
      const result = await authService.login(validatedData);

      // Return success response
      const response: SuccessResponse<typeof result> = {
        success: true,
        data: result,
        message: "Login successful",
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /auth/refresh
   * Get new access token using refresh token
   */
  async refresh(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Validate request body
      const validatedData = RefreshTokenSchema.parse(req.body);

      // Call service
      const result = await authService.refreshToken(validatedData.refreshToken);

      // Return success response
      const response: SuccessResponse<typeof result> = {
        success: true,
        data: result,
        message: "Token refreshed successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /auth/logout
   * Protected route - logout user (requires valid token)
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // User should be authenticated via middleware
      if (!req.user) {
        throw new AppError("User not authenticated", 401);
      }

      // Call service
      const result = await authService.logout(req.user.userId);

      // Return success response
      const response: SuccessResponse<typeof result> = {
        success: true,
        data: result,
        message: result.message,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};
