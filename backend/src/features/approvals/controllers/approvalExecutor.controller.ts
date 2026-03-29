import { Request, Response, NextFunction } from "express";
import { approvalExecutorService } from "../services/approvalExecutor.service";
import { z } from "zod";

const InitializeApprovalsSchema = z.object({
  expenseId: z.string().uuid(),
  workflowId: z.string().uuid(),
});

const ProcessApprovalActionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  comment: z.string().optional(),
});

interface SuccessResponse<T> {
  success: true;
  data: T;
  message: string;
}

interface ErrorResponse {
  success: false;
  error: string;
  statusCode: number;
}

export const approvalExecutorController = {
  /**
   * Initialize approval flow when expense is submitted
   * Creates ExpenseApproval records for the workflow's approvers
   */
  async initializeApprovals(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = InitializeApprovalsSchema.parse(req.body);

      const result = await approvalExecutorService.initializeApprovals(
        validatedData.expenseId,
        validatedData.workflowId,
      );

      const response: SuccessResponse<typeof result> = {
        success: true,
        data: result,
        message:
          result.status === "APPROVED"
            ? "Expense auto-approved (no approvers)"
            : "Approval flow initialized successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Process approver action (approve/reject)
   * Updates ExpenseApproval and evaluates workflow progress
   */
  async processApprovalAction(req: Request, res: Response, next: NextFunction) {
    try {
      const expenseId = String(req.params.expenseId);
      const validatedData = ProcessApprovalActionSchema.parse(req.body);
      const approverId = req.user?.userId;

      if (!approverId) {
        throw new Error("User not authenticated");
      }

      const result = await approvalExecutorService.processApprovalAction(
        expenseId,
        approverId,
        validatedData.action,
        validatedData.comment,
      );

      const statusCode =
        result.status === "APPROVED"
          ? 200
          : result.status === "REJECTED"
            ? 200
            : 202;

      // Build response with correct type
      type ApprovalResult = typeof result;
      const response = {
        success: result.success,
        data: result as ApprovalResult,
        message: result.reason,
      };

      res.status(statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get current approval status for an expense
   */
  async getApprovalStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const expenseId = String(req.params.expenseId);

      const result = await approvalExecutorService.getApprovalStatus(expenseId);

      const response: SuccessResponse<typeof result> = {
        success: true,
        data: result,
        message: "Approval status retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};
