import { Router } from "express";
import authRoutes from "./auth.route";
import approvalsRoutes from "../features/approvals/routes/approvals.routes";
import helloRoutes from "../features/approvals/routes/hello.routes";
import employeeRoutes from "../features/employees/routes/employees.routes";
import managerRoutes from "../features/managers/routes/managers.routes";
import expenseRoutes from "../features/expenses/routes/expenses.routes";
import userRoutes from "../features/users/routes/users.routes";

const router = Router();

// Auth routes
router.use("/auth", authRoutes);

// Feature routes
router.use("/users", userRoutes);
router.use("/approvals", approvalsRoutes);
router.use("/approvals", helloRoutes);
router.use("/employees", employeeRoutes);
router.use("/managers", managerRoutes);
router.use("/expenses", expenseRoutes);

// Health check
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default router;
