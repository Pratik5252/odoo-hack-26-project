import { Router } from "express";
import { authController } from "../auth/controllers/auth.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

/**
 * Public Auth Routes
 */

/**
 * POST /auth/signup
 * Create new user account and company
 */
router.post("/signup", authController.signup);

/**
 * POST /auth/login
 * Authenticate user and return tokens
 */
router.post("/login", authController.login);

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post("/refresh", authController.refresh);

/**
 * Protected Auth Routes
 */

/**
 * POST /auth/logout
 * Logout user (requires valid access token)
 */
router.post("/logout", authMiddleware, authController.logout);

export default router;
