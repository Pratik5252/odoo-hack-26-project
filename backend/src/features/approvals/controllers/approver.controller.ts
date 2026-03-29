import { Request, Response, NextFunction } from "express";
import { approverService } from "../services/approver.service";
import { z } from "zod";

const AddApproverSchema = z.object({
  approverId: z.string().min(1, "Approver ID required"),
  isRequired: z.boolean().default(false),
});

interface SuccessResponse<T> {
  success: true;
  data: T;
  message: string;
}

export const approverController = {
  async addApprover(req: Request, res: Response, next: NextFunction) {
    try {
      const workflowId = String(req.params.workflowId);
      const validatedData = AddApproverSchema.parse(req.body);

      const approver = await approverService.addApprover({
        workflowId,
        ...validatedData,
      });

      const response: SuccessResponse<typeof approver> = {
        success: true,
        data: approver,
        message: "Approver added successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  async removeApprover(req: Request, res: Response, next: NextFunction) {
    try {
      const workflowId = String(req.params.workflowId);
      const approverId = String(req.params.approverId);

      const result = await approverService.removeApprover(
        workflowId,
        approverId,
      );

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

  async getWorkflowApprovers(req: Request, res: Response, next: NextFunction) {
    try {
      const workflowId = String(req.params.workflowId);

      const approvers = await approverService.getWorkflowApprovers(workflowId);

      const response: SuccessResponse<typeof approvers> = {
        success: true,
        data: approvers,
        message: "Approvers retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  async updateApprover(req: Request, res: Response, next: NextFunction) {
    try {
      const workflowId = String(req.params.workflowId);
      const approverId = String(req.params.approverId);
      const { isRequired } = z
        .object({ isRequired: z.boolean() })
        .parse(req.body);

      const approver = await approverService.updateApprover(
        workflowId,
        approverId,
        isRequired,
      );

      const response: SuccessResponse<typeof approver> = {
        success: true,
        data: approver,
        message: "Approver updated successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};
