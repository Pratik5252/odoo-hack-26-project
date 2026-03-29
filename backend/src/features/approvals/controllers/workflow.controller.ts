import { Request, Response, NextFunction } from "express";
import { workflowService } from "../services/workflow.service";
import { z } from "zod";

const CreateWorkflowSchema = z.object({
  name: z.string().min(1, "Workflow name required"),
  description: z.string().optional(),
  isManageApproved: z.boolean().default(false),
  isApprovalSequence: z.boolean().default(false),
  approvers: z
    .array(
      z.object({
        approverId: z.string().min(1, "Approver ID required"),
        position: z
          .number()
          .int()
          .positive("Position must be positive")
          .optional(),
        isRequired: z.boolean().default(false),
      }),
    )
    .optional(),
});

interface SuccessResponse<T> {
  success: true;
  data: T;
  message: string;
}

export const workflowController = {
  async createWorkflow(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = CreateWorkflowSchema.parse(req.body);
      const userId = req.user?.userId;

      if (!userId) {
        return next(new Error("User not authenticated"));
      }

      const workflow = await workflowService.createWorkflow({
        ...validatedData,
        userId,
      });

      const response: SuccessResponse<typeof workflow> = {
        success: true,
        data: workflow,
        message: "Workflow created successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getWorkflow(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);

      const workflow = await workflowService.getWorkflowById(id);

      const response: SuccessResponse<typeof workflow> = {
        success: true,
        data: workflow,
        message: "Workflow retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getAllWorkflows(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      const workflows = await workflowService.getAllWorkflows(userId);

      const response: SuccessResponse<typeof workflows> = {
        success: true,
        data: workflows,
        message: "Workflows retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  async updateWorkflow(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const validatedData = CreateWorkflowSchema.partial().parse(req.body);

      const workflow = await workflowService.updateWorkflow(id, validatedData);

      const response: SuccessResponse<typeof workflow> = {
        success: true,
        data: workflow,
        message: "Workflow updated successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  async deleteWorkflow(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);

      const result = await workflowService.deleteWorkflow(id);

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
