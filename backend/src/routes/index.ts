import { Router } from "express";
import authRoutes from "./auth.route";
import helloRoutes from "../features/approvals/routes/hello.routes";
import employeeRoutes from '../features/employees/routes/employees.routes';
import managerRoutes from '../features/managers/routes/managers.routes';

const router = Router();

// Auth routes
router.use("/auth", authRoutes);

// Feature routes
router.use("/approvals", helloRoutes);
router.use('/employees', employeeRoutes);
router.use('/managers', managerRoutes);

// Health check
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default router;
