import { Request, Response, NextFunction } from "express";
import { approvalRuleService } from "../services/approvalRule.service";
import { z } from "zod";

const CreateApprovalRuleSchema = z.object({
  ruleType: z
    .enum(["PERCENTAGE", "SPECIFIC_APPROVER", "HYBRID"])
    .default("HYBRID"),
  percentageThreshold: z.number().min(0).max(100).optional(),
  requiredApproverId: z.string().optional(),
});

const EvaluateApprovalSchema = z.object({
  approvals: z.array(
    z.object({
      id: z.string(),
      approverId: z.string(),
      status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
      approvedAt: z.string().datetime().optional(),
    }),
  ),
});

interface SuccessResponse<T> {
  success: true;
  data: T;
  message: string;
}

export const approvalRuleController = {
  async createOrUpdateRule(req: Request, res: Response, next: NextFunction) {
    try {
      const workflowId = String(req.params.workflowId);
      const validatedData = CreateApprovalRuleSchema.parse(req.body);

      const rule = await approvalRuleService.createOrUpdateRule({
        workflowId,
        ...validatedData,
      });

      const response: SuccessResponse<typeof rule> = {
        success: true,
        data: rule,
        message: "Approval rule created/updated successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getRule(req: Request, res: Response, next: NextFunction) {
    try {
      const workflowId = String(req.params.workflowId);

      const rule = await approvalRuleService.getRule(workflowId);

      const response: SuccessResponse<typeof rule> = {
        success: true,
        data: rule,
        message: "Approval rule retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  async deleteRule(req: Request, res: Response, next: NextFunction) {
    try {
      const workflowId = String(req.params.workflowId);

      await approvalRuleService.deleteRule(workflowId);

      const response = {
        success: true,
        data: { message: "Approval rule deleted successfully" },
        message: "Approval rule deleted successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Evaluate if approvals meet the workflow's approval rule
   * Used to determine if expense is approved based on hybrid rule engine
   */
  async evaluateApprovals(req: Request, res: Response, next: NextFunction) {
    try {
      const workflowId = String(req.params.workflowId);
      const validatedData = EvaluateApprovalSchema.parse(req.body);

      // Convert approvedAt strings to Date objects
      const approvalsWithDates = validatedData.approvals.map((approval) => ({
        ...approval,
        approvedAt: approval.approvedAt
          ? new Date(approval.approvedAt)
          : undefined,
      }));

      const result = await approvalRuleService.evaluateApprovalRule(
        workflowId,
        approvalsWithDates,
      );

      const response: SuccessResponse<typeof result> = {
        success: true,
        data: result,
        message: result.isApproved
          ? "Approval rule satisfied"
          : "Approval rule not satisfied",
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};
